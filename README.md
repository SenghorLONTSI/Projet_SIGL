# CapApprenti - Plateforme de Gestion des Activités des Ingénieurs Apprentis

## 📋 Description du projet

CapApprenti est une plateforme web générique de gestion des activités des ingénieurs apprentis développée dans le cadre du projet SIGL. Elle vise à centraliser et structurer l'ensemble des démarches liées à l'alternance et au suivi de la formation au sein d'un outil unique et collaboratif.

### Objectifs principaux

La plateforme permet de :
- **Faciliter l'accès à la formation** grâce à une interface intuitive permettant l'inscription, le suivi des dossiers et l'accès aux ressources pédagogiques
- **Améliorer le suivi pédagogique** en offrant aux tuteurs et formateurs une vision en temps réel de l'évolution des apprentis et de leurs compétences
- **Renforcer le lien avec les entreprises** via un espace dédié au suivi des apprentis et à la gestion de l'alternance
- **Optimiser la gestion administrative** par la centralisation des données, des contrats et la production de rapports fiables
- **Favoriser la collaboration** entre tous les acteurs grâce à des outils de communication et de notification intégrés

### Fonctionnalités principales

La plateforme regroupe les activités essentielles du cursus en alternance :

#### Pour les Apprentis
- Authentification sécurisée et gestion de session
- Tableau de bord avec vue d'ensemble des assignments
- Gestion du journal de formation
- Dépôt de documents et livrables pédagogiques
- Suivi des statuts (EN_COURS, TERMINÉ, EN_RETARD)
- Consultation des notifications et deadlines

#### Pour les Maîtres d'Apprentissage (MA)
- Visualisation des apprentis supervisés
- Consultation des journaux de formation
- Validation ou rejet des journaux avec commentaires
- Évaluation via grille de compétences
- Accès au calendrier d'école

#### Pour les Tuteurs Pédagogiques (TP)
- Suivi des apprentis encadrés
- Consultation de la progression des journaux (lecture seule)
- Ajout d'observations pédagogiques globales
- Saisie de notes
- Consultation des absences

#### Pour les Coordinateurs
- Planification des soutenances
- Constitution des jurys
- Affectation des équipes tutorales (MA + TP)

#### Pour les RH
- Gestion des contrats d'apprentissage
- Consultation des absences
- Dépôt d'autorisations de travail
- Gel ou reconduction de contrats

### Technologies utilisées

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Node.js, Next.js Route Handlers
- **Base de données** : PostgreSQL (hébergé sur Neon Cloud)
- **ORM** : Prisma
- **Authentification** : BetterAuth
- **Sécurité** : bcrypt, HTTPS, chiffrement au repos

---

## 🚀 Instructions d'installation

### Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

- **Node.js** version 18.x ou supérieure ([Télécharger Node.js](https://nodejs.org/))
- **npm** (inclus avec Node.js) ou **yarn**
- **Git** ([Télécharger Git](https://git-scm.com/))
- Un compte **Neon** pour la base de données PostgreSQL ([Créer un compte](https://neon.tech/)) ou une instance PostgreSQL locale

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/votre-organisation/capapprenti.git
cd capapprenti
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Ou si vous utilisez yarn :

```bash
yarn install
```

Cette commande installera toutes les dépendances nécessaires définies dans le fichier `package.json`, incluant Next.js, Prisma, BetterAuth, Tailwind CSS, et autres bibliothèques.

### Étape 3 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet en copiant le fichier exemple :

```bash
cp .env.example .env
```

Ensuite, éditez le fichier `.env` et remplissez les variables suivantes :

```env
# URL de connexion à la base de données PostgreSQL
# Format Neon : postgresql://username:password@host/database?sslmode=require
# Format local : postgresql://username:password@localhost:5432/capapprenti
DATABASE_URL="postgresql://user:password@host:port/database"

# Clé secrète pour BetterAuth (générez une clé aléatoire sécurisée)
# Vous pouvez utiliser : openssl rand -base64 32
BETTER_AUTH_SECRET="votre_cle_secrete_aleatoire_ici"

# URL de l'application
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mode de développement
NODE_ENV="development"
```

**Important** : 
- Remplacez `DATABASE_URL` par votre chaîne de connexion PostgreSQL réelle
- Générez une clé secrète forte pour `BETTER_AUTH_SECRET`
- Ne commitez jamais le fichier `.env` dans Git (il est dans `.gitignore`)

### Étape 4 : Configurer la base de données

#### A. Générer le client Prisma

```bash
npx prisma generate
```

Cette commande génère le client Prisma TypeScript basé sur votre schéma.

#### B. Exécuter les migrations

```bash
npx prisma migrate dev
```

Cette commande :
- Crée la base de données si elle n'existe pas
- Exécute toutes les migrations pour créer les tables
- Vous demandera de nommer la migration (par exemple : "init")

#### C. (Optionnel) Remplir la base de données avec des données de test

```bash
npx prisma db seed
```

Cette commande exécute le script de seed pour créer des utilisateurs et données de test.

### Étape 5 : Vérifier la configuration

Pour vérifier que tout est bien configuré, vous pouvez utiliser Prisma Studio :

```bash
npx prisma studio
```

Cette commande ouvre une interface web à `http://localhost:5555` pour visualiser et éditer vos données.

---

## ▶️ Instructions d'exécution

### Lancer l'application en mode développement

```bash
npm run dev
```

Ou avec yarn :

```bash
yarn dev
```

L'application sera accessible à l'adresse : **http://localhost:3000**

Le serveur de développement supporte le Hot Module Replacement (HMR), donc les modifications du code sont automatiquement reflétées dans le navigateur.

### Lancer l'application en mode production

#### Étape 1 : Build de l'application

```bash
npm run build
```

Cette commande :
- Compile le code TypeScript
- Génère les bundles optimisés
- Prépare l'application pour la production

#### Étape 2 : Démarrer le serveur de production

```bash
npm start
```

L'application sera accessible à l'adresse configurée (par défaut **http://localhost:3000**)

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement avec HMR |
| `npm run build` | Compile l'application pour la production |
| `npm start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige automatiquement les erreurs ESLint |
| `npm run type-check` | Vérifie les types TypeScript |
| `npx prisma studio` | Ouvre l'interface Prisma Studio |
| `npx prisma migrate dev` | Crée et applique une nouvelle migration |
| `npx prisma generate` | Génère le client Prisma |
| `npx prisma db seed` | Remplit la base avec des données de test |

### Accéder à l'application

Une fois l'application lancée, ouvrez votre navigateur et accédez à :

```
http://localhost:3000
```

#### Comptes de test (après seed)

Si vous avez exécuté le script de seed, vous pouvez vous connecter avec :

**Apprenti :**
- Email : `apprenti@example.com`
- Mot de passe : `password123`

**Maître d'Apprentissage :**
- Email : `ma@example.com`
- Mot de passe : `password123`

**Tuteur Pédagogique :**
- Email : `tp@example.com`
- Mot de passe : `password123`

### Ports utilisés

- **3000** : Application Next.js
- **5432** : PostgreSQL (si local)
- **5555** : Prisma Studio

Assurez-vous que ces ports sont disponibles avant de lancer l'application.

---

## 🔧 Configuration avancée

### Variables d'environnement complètes

Voici toutes les variables d'environnement disponibles :

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:port/database" # Pour les migrations

# Authentification
BETTER_AUTH_SECRET="votre_cle_secrete"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optionnel, pour les notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre.email@gmail.com"
SMTP_PASSWORD="votre_mot_de_passe_app"
SMTP_FROM="noreply@capapprenti.com"

# Stockage de fichiers (optionnel)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB en bytes

# Mode
NODE_ENV="development" # ou "production"
```

### Configuration de la base de données locale

Si vous préférez utiliser PostgreSQL en local :

1. Installez PostgreSQL sur votre machine
2. Créez une base de données :
```sql
CREATE DATABASE capapprenti;
```
3. Mettez à jour `DATABASE_URL` dans `.env` :
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/capapprenti"
```

### Configuration Neon (recommandé)

1. Créez un compte sur [Neon.tech](https://neon.tech/)
2. Créez un nouveau projet
3. Copiez la chaîne de connexion fournie
4. Ajoutez-la dans votre `.env`

---

## 🐛 Dépannage

### Erreur : "Cannot find module..."

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur de connexion à la base de données

1. Vérifiez que `DATABASE_URL` est correcte dans `.env`
2. Vérifiez que votre base de données est accessible
3. Pour Neon, vérifiez que vous avez ajouté `?sslmode=require`

### Erreur de migration Prisma

```bash
# Réinitialiser la base de données (ATTENTION : supprime toutes les données)
npx prisma migrate reset

# Puis relancer les migrations
npx prisma migrate dev
```

### Port 3000 déjà utilisé

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Ou changez le port dans `package.json` :
```json
"dev": "next dev -p 3001"
```

### Problèmes de build

```bash
# Nettoyer le cache Next.js
rm -rf .next

# Rebuild
npm run build
```

---

## 📚 Documentation supplémentaire

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation BetterAuth](https://www.better-auth.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com)

---

## 👥 Équipe de développement

- **TAKOUDJOU Celia**
- **LONTSI Senghor**
- **MBOSSO Joan**
- **NDIAYE Birahim**


---

## 🤝 Contribution

Pour contribuer au projet :

1. Forkez le repository
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

**Dernière mise à jour** : Janvier 2026 - Sprint 2

Pour toute question, veuillez contacter l'équipe de développement.
