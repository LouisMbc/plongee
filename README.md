# plongee — Inventaire des technologies

Ce document répertorie les technologies, versions et images Docker actuellement utilisées dans ce projet.

## Vue d'ensemble
- Frontend : Next.js (React)
- Backend : Next.js (React) — projet séparé
- Base de données : PostgreSQL (conteneur)
- Administration DB : pgAdmin
- Conteneurisation : Docker & Docker Compose

---

## Versions et dépendances principales

### Frontend (dossier `frontend`)
- Name: frontend
- Version: 0.1.0
- Next.js: 15.5.4
- React: 19.1.0
- ReactDOM: 19.1.0
- TypeScript devDependency: ^5
- ESLint: ^9
- TailwindCSS: ^4 (dev)

Fichier: `frontend/package.json`

### Backend (dossier `backend`)
- Name: backend
- Version: 0.1.0
- Next.js: 15.5.4
- React: 19.1.0
- ReactDOM: 19.1.0
- TypeScript devDependency: ^5
- ESLint: ^9
- TailwindCSS: ^4 (dev)

Fichier: `backend/package.json`

### Docker / Compose
- Dockerfile utilisé pour construire frontend & backend: `docker/Dockerfile`
	- Base image: `node:20-alpine`
	- Multi-stage build (base / deps / builder / runner)
	- Non-root user `nextjs` créé
	- Expose port 3000
- Compose file: `docker/docker-compose.yml`
	- Compose format: 3.8
	- Services:
		- `postgres` : image `postgres:15-alpine` (DB)
		- `pgadmin` : image `dpage/pgadmin4:latest` (DB admin)
		- `frontend` : build from `../frontend` using `../docker/Dockerfile`
		- `backend` : build from `../backend` using `../docker/Dockerfile`
	- Volumes:
		- `postgres_data` (persist DB)
		- `pgadmin_data` (persist pgAdmin)
	- Réseau: `plongee_network` (bridge)



---

## Commandes utiles

Démarrer la stack (depuis `docker/`):

```bash
cd docker
docker-compose up --build
```

Démarrer uniquement la DB:

```bash
docker-compose up -d postgres
```

Exécuter les tests localement (npm must be installed):

```bash
cd frontend
npm ci
npm test

cd ../backend
npm ci
npm test
```

Se connecter à pgAdmin: http://localhost:8080

PostgreSQL (externe sur l'hôte): `localhost:5433` (mappage 5433:5432)

