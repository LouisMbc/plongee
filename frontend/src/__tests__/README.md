# Tests Unitaires Frontend - Application Plongée

## 📋 Vue d'ensemble

Ce répertoire contient les tests unitaires pour l'interface frontend de l'application de gestion de plongées. Les tests sont écrits avec **Jest** et **React Testing Library**.

## 🧪 Tests disponibles

### 1. **NewPlongee.test.tsx** - Workflow complet de création de plongée
Tests couvrant la création d'une plongée et l'ajout d'espèces observées.

#### Tests de création de plongée (5 tests)
- ✅ Affichage du formulaire de création
- ✅ Redirection vers `/login` si pas de token d'authentification
- ✅ Création réussie avec redirection vers l'ajout d'espèces
- ✅ Gestion des erreurs de validation (titre trop court, etc.)
- ✅ Gestion des erreurs réseau (serveur inaccessible)

#### Tests d'ajout d'espèces à une plongée (6 tests)
- ✅ Affichage de la liste des espèces disponibles dans la base de données
- ✅ Ajout d'une espèce à la plongée (appel API POST)
- ✅ Empêcher l'ajout d'espèces déjà ajoutées (bouton désactivé)
- ✅ Recherche d'espèces par nom avec debounce
- ✅ Navigation vers l'accueil avec le bouton "Terminer"
- ✅ Redirection vers `/login` si tentative d'ajout sans token

### 2. **PoissonCard.test.tsx** - Composant de carte d'espèce
Tests du composant d'affichage d'une espèce marine.

#### Tests (4 tests)
- ✅ Affichage du nom de l'espèce
- ✅ Affichage de l'image ou placeholder
- ✅ Lien vers la page de détail de l'espèce
- ✅ Gestion de l'absence d'image

### 3. **Header.test.tsx** - Composant d'en-tête
Tests du composant de navigation principal.

#### Tests (3 tests)
- ✅ Affichage du logo et du titre
- ✅ Liens de navigation pour utilisateur connecté
- ✅ Liens de navigation pour utilisateur non connecté

### 4. **login.test.tsx** - Page de connexion
Tests de la page de connexion utilisateur.

#### Tests
- ✅ Affichage du formulaire de connexion
- ✅ Validation des champs
- ✅ Gestion de la soumission

## 🚀 Lancer les tests

### Tous les tests
```bash
cd frontend
npm test
```

### Un fichier spécifique
```bash
npm test -- NewPlongee.test.tsx
```

### En mode watch (re-exécution automatique)
```bash
npm test -- --watch
```

### Avec coverage
```bash
npm test -- --coverage
```

## 🛠️ Configuration

### Technologies utilisées
- **Jest** : Framework de test
- **@testing-library/react** : Utilitaires pour tester React
- **@testing-library/jest-dom** : Matchers personnalisés pour Jest
- **ts-jest** : Support TypeScript pour Jest

### Configuration Jest
La configuration se trouve dans `frontend/jest.config.js` :
- Transformation TypeScript/JSX avec Next.js
- Support de `@testing-library/jest-dom`
- Mocks automatiques pour `next/link`, `next/image`, `next/navigation`
- Setup personnalisé dans `setupTests.ts`

## 📝 Structure d'un test

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MonComposant from '../app/chemin/page';
import '@testing-library/jest-dom';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('MonComposant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fait quelque chose', async () => {
    render(<MonComposant />);
    
    const element = screen.getByText('Texte');
    expect(element).toBeInTheDocument();
    
    fireEvent.click(element);
    
    await waitFor(() => {
      expect(screen.getByText('Résultat')).toBeInTheDocument();
    });
  });
});
```

## 🔍 Bonnes pratiques

### Sélecteurs
Priorité des sélecteurs (du plus accessible au moins) :
1. `getByRole` - Basé sur le rôle ARIA
2. `getByLabelText` - Pour les formulaires
3. `getByPlaceholderText` - Pour les inputs
4. `getByText` - Pour le contenu textuel
5. `getByTestId` - En dernier recours

### Mocking
- **fetch** : Mockez `global.fetch` pour les appels API
- **localStorage** : Créez un mock complet avec `getItem`, `setItem`, `clear`
- **Next.js** : Mockez `useRouter`, `useParams`, `Link`, `Image`

### Assertions asynchrones
```typescript
// Attendre qu'un élément apparaisse
await waitFor(() => {
  expect(screen.getByText('Chargé')).toBeInTheDocument();
});

// Avec timeout personnalisé
await waitFor(() => {
  expect(screen.getByText('Résultat')).toBeInTheDocument();
}, { timeout: 3000 });
```

## 📊 Résultats actuels

```
Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
```

### Détail par fichier
- **NewPlongee.test.tsx** : 11 tests ✅
- **PoissonCard.test.tsx** : 4 tests ✅
- **Header.test.tsx** : ~3 tests ✅
- **login.test.tsx** : ~6 tests ✅

## 🐛 Debugging

### Voir le DOM rendu
```typescript
import { screen } from '@testing-library/react';
screen.debug(); // Affiche tout le DOM
screen.debug(element); // Affiche un élément spécifique
```

### Logs utiles
```typescript
console.log('Mock calls:', (global.fetch as jest.Mock).mock.calls);
```

### Erreurs courantes

**❌ "Unable to find an element with the text..."**
- Vérifiez que le texte exact est présent (casse, espaces)
- Utilisez `/regex/i` pour ignorer la casse
- Vérifiez avec `screen.debug()`

**❌ "Not wrapped in act(...)"**
- Utilisez `await waitFor()` pour les opérations asynchrones
- Mockez correctement les promises

**❌ "TypeError: Cannot read property 'push' of undefined"**
- Vérifiez que `useRouter` est mocké correctement

## 🔗 Liens utiles

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📌 Notes importantes

### Tests d'intégration vs Tests unitaires
- **Tests unitaires frontend** (ce dossier) : Testent les composants isolés avec des mocks
- **Tests d'intégration backend** (`backend/test/integration/`) : Testent l'API avec une vraie base de données
- **Tests E2E** (`test/userFlow.spec.ts`) : Testent le workflow complet utilisateur avec Playwright

### Environnement
- Les tests frontend n'ont **pas besoin** du backend ou de Docker
- Tous les appels API sont mockés avec `jest.fn()`
- Le localStorage est simulé en mémoire

### CI/CD
Ces tests sont exécutés automatiquement dans la pipeline CI/CD avant chaque déploiement pour garantir la qualité du code.
