# Configuration Docker pour l'Application Plongée

Cette configuration Docker comprend :
- **Frontend Next.js** (port 3000)
- **Backend Next.js** (port 3001) 
- **PostgreSQL** (port 5432)
- **pgAdmin** (port 8080)
- **rfishbase** (port 8000) - API pour les données sur les espèces de poissons

## Démarrage rapide

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
- **rfishbase** : http://localhost:8000/ping
- **pgAdmin** : http://localhost:8080
  - Email: `admin@plongee.com`
  - Mot de passe: `admin123`

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

##  Base de données

### Connexion à PostgreSQL
- **Host** : `localhost` (ou `postgres` depuis les containers)
- **Port** : `5432`
- **Database** : `plongee_db`
- **Username** : `plongee_user`
- **Password** : `plongee_password`

### Initialisation
La base de données est automatiquement initialisée lors du premier démarrage via le script `docker/init-db/01-init.sql`.

**Tables créées :**
- `utilisateur` - Utilisateurs de l'application
- `role` - Rôles (admin/utilisateur)
- `plongee` - Plongées enregistrées
- `espece` - Espèces marines observées
- `plongee_espece` - Liaison plongées ↔ espèces

### Connexion depuis pgAdmin
1. Aller sur http://localhost:8080
2. Se connecter avec :
   - Email: `admin@plongee.com`
   - Mot de passe: `admin123`
3. Ajouter un nouveau serveur :
   - **Name** : Plongee DB
   - **Host** : `postgres` ⚠️ (pas localhost !)
   - **Port** : `5432`
   - **Database** : `plongee_db`
   - **Username** : `plongee_user`
   - **Password** : `plongee_password`

##  Authentification

### API Endpoints (Backend - port 3001)

**Inscription**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "pseudo": "johndoe",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John"
}
```

**Connexion**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "pseudo": "johndoe",
  "password": "password123"
}
```

**Profil utilisateur**
```bash
GET http://localhost:3001/api/auth/me
Authorization: Bearer {token}
```

### Sécurité
- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Tokens **JWT** valides 7 jours
- ✅ Validation des données avec **Zod**
- ✅ Protection CORS configurée

### Frontend
- **Inscription** : http://localhost:3000/register
- **Connexion** : http://localhost:3000/login
- Token JWT stocké dans `localStorage`

##  Service rfishbase

### À quoi sert rfishbase ?
rfishbase est une API REST qui fournit des données scientifiques sur les espèces de poissons depuis la base FishBase. Elle permet d'enrichir les observations de plongée avec des informations biologiques.

### Endpoints principaux
- **Health check** : `GET http://localhost:8000/ping`
- **Rechercher une espèce** : `GET http://localhost:8000/species?name={nom}`
- **Détails d'une espèce** : `GET http://localhost:8000/species/{id}`

### Tests
```bash
# Lancer les tests d'intégration avec rfishbase
./docker/tests/run_rfishbase_tests.sh
```

##  Structure

```
docker/
├── Dockerfile              # Dockerfile optimisé pour Next.js
├── docker-compose.yml      # Configuration des services
├── init-db/
│   └── 01-init.sh          # Script d'initialisation de la DB
└── README.md              # Ce fichier
```

##  Sécurité

**Important** : Les mots de passe par défaut sont pour le développement uniquement !

Pour la production :
1. Changer tous les mots de passe dans `.env`
2. Utiliser des secrets Docker ou variables d'environnement sécurisées
3. Configurer des volumes de backup pour PostgreSQL

##  Dépannage

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

### Erreur réseau iptables (DOCKER-ISOLATION-STAGE-2 does not exist)
```bash
# Solution 1 : Redémarrer Docker
sudo systemctl restart docker

# Solution 2 : Si l'erreur persiste, nettoyer et recréer les règles iptables
# Arrêter Docker complètement (service + socket)
sudo systemctl stop docker.socket docker

sudo iptables -t nat -F DOCKER
sudo iptables -t nat -X DOCKER
sudo iptables -t filter -F DOCKER
sudo iptables -t filter -X DOCKER
sudo iptables -t filter -F DOCKER-ISOLATION-STAGE-1
sudo iptables -t filter -X DOCKER-ISOLATION-STAGE-1
sudo iptables -t filter -F DOCKER-ISOLATION-STAGE-2
sudo iptables -t filter -X DOCKER-ISOLATION-STAGE-2

# Redémarrer Docker (service + socket)
sudo systemctl start docker.socket docker

# Nettoyer les réseaux Docker
docker network prune -f

# Relancer l'application
docker-compose up --build
```

### Erreur "address already in use" sur le port 5432
```bash
# Solution 1 : Arrêter PostgreSQL local
sudo systemctl stop postgresql
sudo systemctl disable postgresql  # Pour éviter le démarrage automatique

# Vérifier qu'aucun processus n'utilise le port
sudo lsof -i :5432

# Relancer Docker
docker-compose up --build

# Solution 2 : Modifier le port dans docker-compose.yml
# Changer la ligne ports de postgres de "5432:5432" à "5433:5432"
# Puis adapter vos connexions pour utiliser le port 5433
```

### Erreur "address already in use" sur d'autres ports (3000, 3001, 8080)
```bash
# Identifier le processus qui utilise le port (exemple pour 3000)
sudo lsof -i :3000

# Arrêter le processus (remplacer PID par le numéro affiché)
kill -9 PID

# Ou arrêter tous les processus Node.js
pkill -f node
```

### Erreur CORS (Cross-Origin)
```bash
# Si vous voyez "CORS Missing Allow Origin"
# Vérifiez que next.config.ts contient la configuration CORS
# Puis reconstruisez le backend :
docker-compose down
docker-compose up --build backend
```

### Erreur "Cannot find module @tailwindcss/postcss"
```bash
# Assurez-vous que package.json contient :
# "@tailwindcss/postcss": "^4.0.0" dans dependencies
cd backend
npm install
cd ../docker
docker-compose up --build backend
```