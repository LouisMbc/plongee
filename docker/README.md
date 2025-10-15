# Configuration Docker pour l'Application Plongée

Cette configuration Docker comprend :
- **Frontend Next.js** (port 3000)
- **Backend Next.js** (port 3001) 
- **PostgreSQL** (port 5432)
- **pgAdmin** (port 8080)

## 🚀 Démarrage rapide

### 1. Prérequis
- Docker et Docker Compose installés
- Copier `.env.example` vers `.env` et adapter les variables si nécessaire

```bash
cp .env.example .env
```

### 2. Construire et démarrer tous les services

```bash
cd docker
docker-compose up --build
```

### 3. Accéder aux services

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001  
- **pgAdmin** : http://localhost:8080
  - Email: `admin@plongee.com`
  - Mot de passe: `admin123`

## 🔧 Commandes utiles

### Démarrer en arrière-plan
```bash
docker-compose up -d --build
```

### Voir les logs
```bash
docker-compose logs -f
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

### Arrêter les services
```bash
docker-compose down
```

### Arrêter et supprimer les volumes
```bash
docker-compose down -v
```

### Reconstruire un service spécifique
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## 🗄️ Base de données

### Connexion à PostgreSQL
- **Host** : `localhost` (ou `postgres` depuis les containers)
- **Port** : `5432`
- **Database** : `plongee_db`
- **Username** : `plongee_user`
- **Password** : `plongee_password`

### Initialisation
La base de données est automatiquement initialisée avec des tables d'exemple lors du premier démarrage via le script `docker/init-db/01-init.sh`.

### Connexion depuis pgAdmin
1. Aller sur http://localhost:8080
2. Se connecter avec les credentials pgAdmin
3. Ajouter un nouveau serveur :
   - **Name** : Plongee DB
   - **Host** : `postgres`
   - **Port** : `5432`
   - **Database** : `plongee_db`
   - **Username** : `plongee_user`
   - **Password** : `plongee_password`

## 📁 Structure

```
docker/
├── Dockerfile              # Dockerfile optimisé pour Next.js
├── docker-compose.yml      # Configuration des services
├── init-db/
│   └── 01-init.sh          # Script d'initialisation de la DB
└── README.md              # Ce fichier
```

## 🔒 Sécurité

⚠️ **Important** : Les mots de passe par défaut sont pour le développement uniquement !

Pour la production :
1. Changer tous les mots de passe dans `.env`
2. Utiliser des secrets Docker ou variables d'environnement sécurisées
3. Configurer des volumes de backup pour PostgreSQL

## 🐛 Dépannage

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Nettoyer et recommencer
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Problème de connexion à la DB
```bash
# Vérifier que PostgreSQL est prêt
docker-compose exec postgres pg_isready -U plongee_user -d plongee_db
```

### Problème de build Next.js
```bash
# Nettoyer le cache
docker-compose down
docker system prune -f
docker-compose build --no-cache
```