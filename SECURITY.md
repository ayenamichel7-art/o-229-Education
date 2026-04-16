# Politique de Sécurité (Security Policy)

## Versions Supportées

Nous prenons au sérieux la sécurité de la plateforme o-229. Voici les versions actuellement supportées et pour lesquelles nous fournissons des mises à jour de sécurité.

| Version | Supportée          | Fin de support |
| ------- | ------------------ | -------------- |
| 1.x.x   | :white_check_mark: | TBD            |

## Signalement d'une Vulnérabilité

**Ne signalez pas les vulnérabilités de sécurité via des issues GitHub publiques.**

Si vous découvrez un problème de sécurité dans o-229, veuillez nous en informer immédiatement en envoyant un email à l'équipe de sécurité : **security@o-229.com** (à remplacer par votre email réel).

Veuillez inclure les informations suivantes dans votre signalement :
- Le type de vulnérabilité (XSS, SQLi, RCE, etc.).
- Les étapes pour reproduire le problème.
- L'impact potentiel.
- Si possible, une suggestion de correctif.

Nous nous engageons à :
1. Accuser réception de votre rapport dans les 48 heures.
2. Évaluer et valider la vulnérabilité dans les 5 jours ouvrables.
3. Fournir une estimation pour la résolution.
4. Vous tenir informé de l'avancement des correctifs.

## 🛡️ Le Bouclier de Sécurité (GitHub Shield)

Pour garantir qu'aucune faille de sécurité ou dépendance obsolète n'atteigne le dépôt GitHub ou la production, o-229 implémente une architecture de sécurité automatisée en 4 couches (Le "GitHub Shield") :

### 1. Protection au niveau du développeur (Pré-commit)
Avant même que le code ne quitte l'ordinateur du développeur, il passe par notre système Husky :
- **Gitleaks** : Un scanner qui bloque strictement les commits contenant des secrets (`.env`, clés API, mots de passe).
- **Lint-staged** : Formate et vérifie automatiquement la qualité du code modifié (ESLint, Pint) avant l'enregistrement.

### 2. Le Pipeline d'Intégration Continue (Garde-frontière CI/CD)
À chaque `push` ou `Pull Request`, notre pipeline d'intégration continue bloque toute anomalie :
- **Strict NPM & Composer Audit** : Le pipeline vérifie vos dépendances. S'il détecte une faille de niveau *Critique* ou *Élevé* (`npm audit --audit-level=high`), le pipeline échoue immédiatement et bloque le déploiement. 
- **Analyse Statique Avancée (SAST)** : PHPStan et ESLint bloquent continuellement le code non conforme.
- **Vérification d'absence de fichiers `.env`** : Un script de sécurité empêche fermement la présence de fichiers locaux d'environnement dans l'historique Git.

### 3. GitHub Code Scanning (CodeQL)
Intégré directement avec GitHub Advanced Security, **CodeQL** tourne de manière transparente sur chaque Pull Request. 
- Il lance une analyse sémantique profonde (sur le JavaScript, TypeScript, etc.) pour intercepter des failles logiques (Ex: failles XSS, injections SQL, problèmes de gestion mémoire).
- Tout comportement dangereux est signalé directement sur la PR de GitHub avec l'emplacement de l'erreur et le moyen de la corriger.

### 4. Maintien Automatisé (Dependabot)
Le monde évolue vite et de nouvelles failles sont découvertes chaque jour. Pour éviter que le projet ne vieillisse :
- **Dependabot** est configuré pour scanner l'entièreté du projet de manière hebdomadaire (Actions GitHub, NPM, Composer, Docker).
- S'il détecte un package obsolète (qui pourrait causer une faille), il crée lui-même la *Pull Request* pour le mettre à jour.

## 🔐 Sécurité de l'Infrastructure (Serveurs & Base de Données)

Au delà du code, le déploiement sur les serveurs de production respecte des normes strictes d'isolation :

### Sécurité Réseau & Docker
- **Réseau Isolé (Docker Bridge)** : Tous les services critiques (PostgreSQL, Redis, MinIO S3, Laravel Queue Worker) fonctionnent sur un réseau interne chiffré créé par Docker (`o229-network`).
- **Aucun accès externe direct** : Les ports de la base de données (5432) et du cache Redis ne sont **jamais exposés** directement à l'internet ou à la machine hôte. 
- Seul le **Reverse Proxy Nginx** (via le port 80/443) est autorisé à communiquer avec l'extérieur, redirigeant le trafic HTTP/HTTPS uniquement vers les bons conteneurs (Frontend ou API).

### Base de Données (PostgreSQL Multi-Tenant)
L'architecture de la base de données est structurée pour prévenir nativement la fuite d'informations entre clients :
- **Clés d'isolation (Tenancy)** : Les données de chaque école (tenant) sont structurellement séparées dans la base de données.
- **Passwords Strong** : Toutes les bases de données et services internes (MinIO, Redis, Postgres) exigent des mots de passe robustes et injectés uniquement à l'exécution via un `.env` sécurisé monté dans le serveur.
- Aucune requête brute ou injection SQL n'est possible grâce à l'utilisation systématique de l'ORM Éloquent de Laravel et ses requêtes préparées (Prepared Statements).

---
*Merci de contribuer de manière responsable à la sécurité et à la fiabilité de la plateforme o-229 !*
