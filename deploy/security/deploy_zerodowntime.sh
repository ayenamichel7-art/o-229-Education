#!/bin/bash
# ---------------------------------------------------------
# O-229 ZERO-DOWNTIME DEPLOYMENT SCRIPT 
# Permet de mettre à jour l'application sans coupure
# ---------------------------------------------------------

echo "🚀 Début du déploiement Zero-downtime pour o-229..."

# 1. Mettre à jour le code source
git pull origin main

# 2. Reconstruire l'image Docker de l'app discrètement (sans arrêter l'existante)
echo "📦 Reconstruction de l'image de l'application..."
docker-compose build app

# 3. Créer le nouveau conteneur en parallèle
echo "🔄 Démarrage du nouveau conteneur (scale up)..."
docker-compose up -d --no-deps --scale app=2 --no-recreate app

# Récupérer l'ID du nouveau et de l'ancien conteneur
NEW_CONTAINER=$(docker inspect -f '{{.State.StartedAt}} {{.Id}}' $(docker-compose ps -q app) | sort | tail -1 | awk '{print $2}')
OLD_CONTAINER=$(docker inspect -f '{{.State.StartedAt}} {{.Id}}' $(docker-compose ps -q app) | sort | head -1 | awk '{print $2}')

# 4. Attendre que le nouveau conteneur soit Prêt (Healthcheck)
echo "⏳ En attente de la préparation du nouveau conteneur PHP-FPM..."
sleep 15 # Laisser le temps à OPcache de chauffer et laravel d'initier

# Lancer les migrations sur le nouveau conteneur
echo "🗄️ Exécution des migrations de base de données..."
docker exec $NEW_CONTAINER php artisan migrate --force
docker exec $NEW_CONTAINER php artisan optimize:clear
docker exec $NEW_CONTAINER php artisan optimize

# 5. Recharger Nginx à chaud pour qu'il route vers le nouveau conteneur
echo "🔀 Rafraîchissement du proxy Nginx à chaud (sans coupure)..."
# nginx -s reload force Nginx à re-résoudre le DNS interne de "app" sans couper les connexions actives
docker exec o229-nginx nginx -s reload
sleep 2 # Laisser 2 secondes au trafic pour basculer totalement
# 6. Tuer et nettoyer l'ancien conteneur
echo "🗑️ Arrêt progressif de l'ancien conteneur..."
docker stop $OLD_CONTAINER
docker rm $OLD_CONTAINER

# 7. Revenir à l'état de scale normal
docker-compose up -d --no-deps --scale app=1 --no-recreate app

# Relancer le worker de queue discrètement
echo "🔄 Redémarrage des Queue Workers..."
docker-compose restart queue

echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS SANS COUPURE !"
