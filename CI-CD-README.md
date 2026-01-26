# Pipeline CI/CD - Projet Plongée

Ce document explique le pipeline CI/CD mis en place pour le projet.

## 📋 Tests Créés

### Backend

#### Tests Unitaires
- **[backend/src/lib/__tests__/validation.test.ts](backend/src/lib/__tests__/validation.test.ts)** : Tests des schémas de validation Zod
  - registerSchema (inscription)
  - loginSchema (connexion)
  - updateProfileSchema (mise à jour profil)

- **[backend/src/lib/__tests__/auth.test.ts](backend/src/lib/__tests__/auth.test.ts)** : Tests des fonctions d'authentification
  - hashPassword (hashage de mot de passe)
  - comparePassword (vérification de mot de passe)
  - generateToken (génération JWT)
  - verifyToken (vérification JWT)

#### Tests d'Intégration
- **[backend/test/integration/auth-api.test.ts](backend/test/integration/auth-api.test.ts)** : Tests de l'API d'authentification
  - POST /api/auth/login
  - Cas: succès, échec, utilisateur bloqué, données invalides

- **[backend/test/integration/plongees-api.test.ts](backend/test/integration/plongees-api.test.ts)** : Tests de l'API plongées
  - POST /api/plongees
  - Cas: création, validation, authentification, autorisation

### Frontend

#### Tests des Composants
- **[frontend/src/__tests__/login.test.tsx](frontend/src/__tests__/login.test.tsx)** : Tests de la page de connexion (déjà existant)

- **[frontend/src/__tests__/Header.test.tsx](frontend/src/__tests__/Header.test.tsx)** : Tests du composant Header
  - Affichage selon état de connexion
  - Déconnexion
  - Liens admin

- **[frontend/src/__tests__/PoissonCard.test.tsx](frontend/src/__tests__/PoissonCard.test.tsx)** : Tests du composant PoissonCard
  - Affichage des informations
  - Gestion des images
  - Navigation

## 🚀 Lancer les Tests Localement

### Backend
```bash
cd backend
npm install
npm test                  # Lancer tous les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Avec couverture de code
```

### Frontend
```bash
cd frontend
npm install
npm test                  # Lancer tous les tests
npm run test:watch        # Mode watch
```

## 🔄 Workflow GitHub Actions

Le fichier [.github/workflows/ci.yml](.github/workflows/ci.yml) configure le pipeline CI/CD qui s'exécute automatiquement à chaque push ou pull request sur les branches `main` et `develop`.

### Jobs du Pipeline

1. **backend-tests** : Exécute les tests backend
   - Installation des dépendances
   - Linter
   - Tests unitaires et d'intégration
   - Génération de la couverture de code

2. **frontend-tests** : Exécute les tests frontend
   - Installation des dépendances
   - Linter
   - Tests des composants React
   - Génération de la couverture de code

3. **backend-build** : Build du backend
   - S'exécute après les tests backend
   - Vérifie que le projet compile

4. **frontend-build** : Build du frontend
   - S'exécute après les tests frontend
   - Vérifie que le projet compile

5. **integration-tests** : Tests d'intégration avec PostgreSQL
   - S'exécute après les builds
   - Utilise un service PostgreSQL
   - Optionnel (continue même en cas d'échec)

6. **notify-success** : Notification
   - S'exécute si tous les jobs précédents réussissent

## 📊 Couverture de Code

Les rapports de couverture sont automatiquement uploadés sur Codecov (si configuré). Vous pouvez aussi les consulter localement :

- Backend : `backend/coverage/lcov-report/index.html`
- Frontend : `frontend/coverage/lcov-report/index.html`

## ⚙️ Configuration

### Variables d'Environnement GitHub

Pour les tests d'intégration, le workflow utilise PostgreSQL. Les credentials sont :
- User: `plongee_user`
- Password: `plongee_password`
- Database: `plongee_db`

### Modifications Nécessaires

1. **Backend package.json** : Scripts de test ajoutés
2. **Backend jest.config.js** : Configuration pour TypeScript et tests unitaires/intégration
3. **Frontend** : Déjà configuré

## 🎯 Prochaines Étapes

1. Installer les dépendances backend :
   ```bash
   cd backend
   npm install
   ```

2. Pousser le code sur GitHub :
   ```bash
   git add .
   git commit -m "feat: Add CI/CD pipeline with unit and integration tests"
   git push origin main
   ```

3. Vérifier l'exécution du workflow dans l'onglet "Actions" de votre repository GitHub

## ✅ Bonnes Pratiques

- Les tests s'exécutent à chaque push
- Les pull requests ne peuvent être mergées que si les tests passent
- La couverture de code vous aide à identifier les parties non testées
- Les tests unitaires sont rapides et testent la logique métier
- Les tests d'intégration vérifient les interactions entre modules
