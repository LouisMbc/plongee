# Tests d'Intégration - Application Plongée

## 📋 Vue d'ensemble

Ce fichier contient **30 tests d'intégration** qui vérifient le bon fonctionnement de l'ensemble de l'API backend avec une vraie base de données PostgreSQL.

## 🎯 Objectif

Les tests d'intégration valident que tous les endpoints de l'API fonctionnent correctement ensemble, avec:
- La vraie base de données PostgreSQL
- L'authentification JWT
- Les relations entre les tables
- Les autorisations et la sécurité
- Les suppressions en cascade

## 🏗️ Structure des tests

### 1. Tests d'Authentification (11 tests)

#### POST /api/auth/register
- ✓ Création d'un nouvel utilisateur avec toutes les informations requises
- ✓ Refus d'un pseudo déjà utilisé (erreur 409)
- ✓ Validation des données (pseudo/mot de passe trop courts)

#### POST /api/auth/login
- ✓ Connexion réussie avec identifiants valides
- ✓ Refus des identifiants incorrects (erreur 401)
- ✓ Refus d'un utilisateur inexistant

#### GET /api/auth/me
- ✓ Récupération du profil de l'utilisateur connecté
- ✓ Refus sans token d'authentification
- ✓ Refus avec un token invalide

#### PUT /api/auth/update-profile
- ✓ Mise à jour du profil utilisateur (nom, prénom)

#### PUT /api/auth/change-password
- ✓ Changement de mot de passe avec vérification de l'ancien mot de passe

---

### 2. Tests des Plongées (4 tests)

#### POST /api/plongees
- ✓ Création d'une nouvelle plongée avec titre, date, profondeur, etc.
- ✓ Refus d'une plongée sans titre (validation)
- ✓ Refus sans authentification (erreur 401)

#### GET /api/plongees
- ✓ Récupération de toutes les plongées de l'utilisateur connecté

---

### 3. Tests des Espèces (6 tests)

#### GET /api/especes
- ✓ Récupération de la liste des espèces avec pagination
- ✓ Filtrage des espèces par recherche textuelle

#### POST /api/especes
- ✓ Création d'une nouvelle espèce ou récupération si elle existe déjà

#### POST /api/plongees/[id]/especes
- ✓ Ajout d'une espèce à une plongée spécifique
- ✓ Refus d'ajouter la même espèce deux fois (erreur 409)

#### GET /api/plongees/[id]/especes
- ✓ Récupération de toutes les espèces observées lors d'une plongée

---

### 4. Tests d'Administration (6 tests)

#### GET /api/admin/users
- ✓ Récupération de tous les utilisateurs (réservé aux admins)
- ✓ Refus d'accès aux non-admins (erreur 403)

#### PATCH /api/admin/users/[id]/block
- ✓ Blocage d'un utilisateur (empêche la connexion)
- ✓ Déblocage d'un utilisateur

#### PATCH /api/admin/users/[id]/promote
- ✓ Promotion d'un utilisateur en administrateur

#### DELETE /api/admin/users/[id]
- ✓ Suppression d'un utilisateur

---

### 5. Tests de Sécurité & Autorisations (2 tests)

- ✓ Impossibilité d'ajouter des espèces à la plongée d'un autre utilisateur (erreur 404)
- ✓ Un utilisateur ne voit que ses propres plongées

---

### 6. Tests de Cascade & Relations (1 test)

- ✓ Suppression automatique des plongées quand un utilisateur est supprimé (CASCADE)

---

## 🚀 Comment lancer les tests

### Prérequis

1. **Backend en cours d'exécution** sur `http://localhost:3001`
2. **PostgreSQL accessible** sur `localhost:5433`
3. Variables d'environnement configurées dans `.env.test`

### Commandes

```bash
# Lancer tous les tests d'intégration
npm test -- test/integration/api-integration.test.ts

# Lancer avec plus de détails
npm test -- test/integration/api-integration.test.ts --verbose

# Lancer en mode watch
npm test -- test/integration/api-integration.test.ts --watch
```

---

## ⚙️ Configuration

### Fichier `.env.test`

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=plongee_db
DB_USER=plongee_user
DB_PASSWORD=plongee_password
JWT_SECRET=your-secret-key-change-in-production
```

### Setup automatique

Le fichier `test/setup.ts` charge automatiquement les variables d'environnement avant l'exécution des tests.

---

## 🧹 Gestion des données de test

### Avant tous les tests (beforeAll)
- Suppression de toutes les données de test existantes
- Création d'un utilisateur principal (`integtestmain`)
- Ce user est utilisé pour les tests de plongées et d'espèces

### Pendant les tests
- Les tests d'authentification créent/suppriment leurs propres utilisateurs
- Les tests d'administration créent un utilisateur admin temporaire

### Après tous les tests (afterAll)
- **Nettoyage complet** de toutes les données de test
- Suppression de tous les utilisateurs commençant par `integtest`
- Vérification qu'aucun utilisateur de test ne reste en base

---

## 📊 Résultats attendus

```
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        ~3-4s
```

✅ **Tous les utilisateurs de test sont supprimés à la fin**

---

## 🔍 Points clés testés

1. **Authentification JWT** - Tous les endpoints protégés vérifient les tokens
2. **Validation des données** - Zod valide les entrées utilisateur
3. **Autorisations** - Seuls les admins accèdent aux routes d'administration
4. **Isolation des données** - Les utilisateurs ne voient que leurs propres plongées
5. **Intégrité référentielle** - Les relations en cascade fonctionnent correctement
6. **Sécurité** - Impossibilité de modifier les données d'autres utilisateurs

---

## 🐛 Dépannage

### Les tests échouent avec "Token invalide"
- Vérifiez que le backend utilise le même `JWT_SECRET` que dans `.env.test`

### Erreur "Failed to create user: Ce pseudo est déjà utilisé"
- Des données de test précédentes n'ont pas été nettoyées
- Lancez manuellement le nettoyage SQL:
```sql
DELETE FROM role WHERE id_utilisateur IN (SELECT id FROM utilisateur WHERE pseudo LIKE 'integtest%');
DELETE FROM utilisateur WHERE pseudo LIKE 'integtest%';
```

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL tourne sur le port 5433: `docker ps`
- Vérifiez les credentials dans `.env.test`

---

## 📝 Maintenance

Pour ajouter de nouveaux tests:

1. Utilisez le pattern d'authentification existant:
   ```typescript
   headers: { 'Authorization': `Bearer ${testUserToken}` }
   ```

2. Créez des utilisateurs temporaires si nécessaire:
   ```typescript
   const { userId, token } = await createTestUser('uniquepseudo', false);
   ```

3. Nettoyez les données spécifiques dans un `afterAll()` du describe

4. Assurez-vous que le nettoyage global fonctionne (pattern `integtest%`)
