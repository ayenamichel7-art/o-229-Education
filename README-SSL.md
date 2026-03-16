# Configuration SSL Cloudflare (Mode Full Strict)

Nginx est actuellement configuré pour fonctionner en HTTPS (port 443) en s'attendant à recevoir du trafic provenant exclusivement des proxys Cloudflare.

Cependant, Cloudflare exige des certificats SSL dit "Origin Certificates" (Certificats d'origine) entre Nginx et Cloudflare pour que le mode "Full (Strict)" fonctionne. 

**Pour l'instant, de faux certificats auto-signés temporaires ont été placés dans le dossier `docker/nginx/ssl` afin que Nginx puisse démarrer sans erreur locale. Mais Cloudflare les rejettera en mode "Full (Strict)".**

Voici les étapes exactes pour configurer correctement vos certificats définitifs :

## Étape 1 : Générer les certificats Cloudflare

1. Allez sur votre dashboard **Cloudflare** > Sélectionnez votre domaine `o-229.com`.
2. Allez dans le menu de gauche : **SSL/TLS** > **Origin Server** (Serveur d'origine).
3. Cliquez sur le bouton bleu **Create Certificate** (Créer un certificat).
4. Laissez les options par défaut :
   - Generate private key and CSR with Cloudflare (Générer la clé privée et le CSR avec Cloudflare).
   - RSA (2048)
   - Hostnames : `*.o-229.com`, `o-229.com`
   - Certificate Validity : 15 years (15 ans)
5. Cliquez sur **Create**.

## Étape 2 : Coller les certificats sur votre serveur

Cloudflare va afficher deux blocs de texte. Vous devez copier/coller ces textes EXACTEMENT dans deux fichiers sur votre serveur (ou dans votre dossier local `o-229`).

1. **Origin Certificate** (Certificat d'origine) :
   - Éditez le fichier : `docker/nginx/ssl/cloudflare-origin.pem`
   - Supprimez le contenu factice actuel.
   - Collez le texte "Origin Certificate" fourni par Cloudflare (incluant `-----BEGIN CERTIFICATE-----` et `-----END CERTIFICATE-----`).

2. **Private Key** (Clé privée) :
   - Éditez le fichier : `docker/nginx/ssl/cloudflare-origin-key.pem`
   - Supprimez le contenu factice actuel.
   - Collez le texte "Private Key" fourni par Cloudflare (incluant `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`).

> ⚠️ **Sécurité** : Ne donnez jamais cette clé privée à personne et ne la commitez pas sur un dépôt Git public.

## Étape 3 : Configurer le mode SSL sur Cloudflare

1. Dans Cloudflare, allez dans le menu **SSL/TLS** > **Overview** (Aperçu).
2. Sélectionnez l'option **Full (Strict)**.

## Étape 4 : Redémarrer Nginx

Une fois les deux fichiers remplacés, rechargez Nginx pour qu'il prenne en compte les vrais certificats :

```bash
docker compose restart nginx
```

Votre site est désormais protégé de bout en bout avec TLS 1.3, et Nginx est sécurisé contre les failles courantes.
