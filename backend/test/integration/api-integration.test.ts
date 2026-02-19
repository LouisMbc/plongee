/**
 * Tests d'intégration complets pour l'application de plongée
 * Ces tests vérifient le bon fonctionnement des API avec la vraie base de données
 */

import pool from '@/lib/db';

const API_URL = 'http://localhost:3001';

// Variables globales pour les tests
let authTestUserId: string;
let authTestUserToken: string;
let testUserId: string;
let testUserToken: string;
let adminUserId: string;
let adminToken: string;
let testPlongeeId: string;
let testEspeceId: string;

// Helper pour créer un utilisateur de test
async function createTestUser(pseudo: string, isAdmin = false) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pseudo,
      nom: 'Test',
      prenom: 'User',
      password: 'Test123456',
    }),
  });
  const data = await res.json();
  
  if (!res.ok) {
    console.error('❌ Failed to create user:', pseudo, 'Status:', res.status, 'Data:', data);
    throw new Error(`Failed to create test user: ${JSON.stringify(data)}`);
  }
  
  if (!data.user?.id || !data.token) {
    console.error('❌ Invalid response data:', data);
    throw new Error('Invalid response from register API');
  }
  
  if (isAdmin && data.user?.id) {
    console.log('Creating admin for user ID:', data.user.id);
    
    // Attendre que l'utilisateur soit bien créé
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Vérifier si l'utilisateur existe et ajouter le rôle admin
    const userCheck = await pool.query(
      'SELECT id FROM utilisateur WHERE id = $1',
      [data.user.id]
    );
    
    console.log('User exists check:', userCheck.rows.length > 0);
    
    if (userCheck.rows.length > 0) {
      // Promouvoir en admin directement dans la DB
      const roleResult = await pool.query(
        'INSERT INTO role (id_utilisateur, admin) VALUES ($1, true) ON CONFLICT (id_utilisateur) DO UPDATE SET admin = true RETURNING *',
        [data.user.id]
      );
      console.log('Role insert result:', roleResult.rows);
    }
  }
  
  return { userId: data.user.id, token: data.token };
}

// Nettoyage avant tous les tests
beforeAll(async () => {
  console.log('🧹 Cleaning existing test data...');
  
  // Supprimer les données de test existantes
  await pool.query("DELETE FROM plongee_espece WHERE id_plongee IN (SELECT id FROM plongee WHERE titre LIKE 'Test%')");
  await pool.query("DELETE FROM plongee WHERE titre LIKE 'Test%'");
  await pool.query("DELETE FROM espece WHERE nom LIKE 'Test%'");
  await pool.query("DELETE FROM role WHERE id_utilisateur IN (SELECT id FROM utilisateur WHERE pseudo LIKE 'integtest%')");
  const deleteRes = await pool.query("DELETE FROM utilisateur WHERE pseudo LIKE 'integtest%' RETURNING pseudo");
  console.log(`✅ Deleted ${deleteRes.rowCount} existing test users:`, deleteRes.rows.map(r => r.pseudo));
  
  // Attendre un peu pour que les suppressions soient effectives
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Créer un utilisateur principal pour les tests de plongées et espèces
  console.log('🔧 Creating main test user...');
  const { userId, token } = await createTestUser('integtestmain', false);
  testUserId = userId;
  testUserToken = token;
  console.log('✅ Main test user created:', 'integtestmain', 'ID:', testUserId);
  console.log('✅ Token:', token?.substring(0, 30) + '...');
});

// Nettoyage après tous les tests
afterAll(async () => {
  console.log('🧹 Nettoyage final de tous les utilisateurs de test...');
  
  // Supprimer toutes les données de test
  await pool.query("DELETE FROM plongee_espece WHERE id_plongee IN (SELECT id FROM plongee WHERE titre LIKE 'Test%')");
  await pool.query("DELETE FROM plongee WHERE titre LIKE 'Test%'");
  await pool.query("DELETE FROM espece WHERE nom LIKE 'Test%'");
  await pool.query("DELETE FROM role WHERE id_utilisateur IN (SELECT id FROM utilisateur WHERE pseudo LIKE 'integtest%')");
  
  // Supprimer tous les utilisateurs de test
  const deleteResult = await pool.query("DELETE FROM utilisateur WHERE pseudo LIKE 'integtest%' RETURNING pseudo");
  console.log(`✅ ${deleteResult.rowCount} utilisateur(s) de test supprimé(s):`, deleteResult.rows.map(r => r.pseudo));
  
  // Vérifier qu'il ne reste aucun utilisateur de test
  const remainingUsers = await pool.query("SELECT pseudo FROM utilisateur WHERE pseudo LIKE 'integtest%'");
  if (remainingUsers.rowCount > 0) {
    console.warn('⚠️ Il reste des utilisateurs de test:', remainingUsers.rows);
  } else {
    console.log('✅ Tous les utilisateurs de test ont été supprimés');
  }
  
  await pool.end();
});

describe('Tests d\'intégration - Authentification', () => {
  afterEach(async () => {
    // Nettoyer les utilisateurs créés pendant les tests d'auth uniquement
    if (authTestUserId) {
      await pool.query('DELETE FROM role WHERE id_utilisateur = $1', [authTestUserId]);
      await pool.query('DELETE FROM utilisateur WHERE id = $1', [authTestUserId]);
    }
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const uniquePseudo = `integtestuser${Date.now()}`;
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: uniquePseudo,
          nom: 'Dupont',
          prenom: 'Jean',
          password: 'Password123',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.pseudo).toBe(uniquePseudo);
      expect(data.user.nom).toBe('Dupont');
      authTestUserId = data.user.id;
      authTestUserToken = data.token;
    });

    it('devrait refuser un pseudo déjà existant', async () => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'integtestmain',  // Utilise le user principal déjà créé
          nom: 'Test',
          prenom: 'Test',
          password: 'Password123',
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('déjà utilisé');
    });

    it('devrait refuser des données invalides', async () => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'ab', // Trop court
          nom: 'Test',
          prenom: 'Test',
          password: '123', // Trop court
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'integtestmain',  // Utilise le user principal créé dans beforeAll
          password: 'Test123456',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.pseudo).toBe('integtestmain');
    });

    it('devrait refuser des identifiants invalides', async () => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'testuser1',
          password: 'WrongPassword',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('devrait refuser un utilisateur inexistant', async () => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'usernotexist',
          password: 'Password123',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` },  // Utilise le token du user principal
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.pseudo).toBe('integtestmain');
      expect(data.user.id).toBe(testUserId);
    });

    it('devrait refuser l\'accès sans token', async () => {
      const res = await fetch(`${API_URL}/api/auth/me`);
      expect(res.status).toBe(401);
    });

    it('devrait refuser un token invalide', async () => {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': 'Bearer invalidtoken' },
      });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    it('devrait mettre à jour le profil utilisateur', async () => {
      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`,  // Utilise le token du user principal
        },
        body: JSON.stringify({
          nom: 'Martin',
          prenom: 'Paul',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.nom).toBe('Martin');
      expect(data.user.prenom).toBe('Paul');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('devrait changer le mot de passe', async () => {
      // Créer un utilisateur temporaire pour ce test
      const uniquePseudo = `integtestpwd${Date.now()}`;
      const { userId: pwdUserId, token: pwdUserToken } = await createTestUser(uniquePseudo, false);
      
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pwdUserToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'Test123456',
          newPassword: 'NewPassword456',
        }),
      });

      expect(res.status).toBe(200);

      // Vérifier la connexion avec le nouveau mot de passe
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: uniquePseudo,
          password: 'NewPassword456',
        }),
      });
      expect(loginRes.status).toBe(200);
      
      // Nettoyer l'utilisateur temporaire
      await pool.query('DELETE FROM role WHERE id_utilisateur = $1', [pwdUserId]);
      await pool.query('DELETE FROM utilisateur WHERE id = $1', [pwdUserId]);
    });
  });
});

describe('Tests d\'intégration - Plongées', () => {
  describe('POST /api/plongees', () => {
    it('devrait créer une nouvelle plongée', async () => {
      const res = await fetch(`${API_URL}/api/plongees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          titre: 'Test Plongée Marseille',
          description: 'Belle plongée dans les calanques',
          date: '2024-01-15T10:00:00Z',
          type: 'Exploration',
          profondeur: 25,
          temps: 45,
          lieu: 'Marseille, Calanques',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.plongee.titre).toBe('Test Plongée Marseille');
      expect(data.plongee.profondeur).toBe(25);
      testPlongeeId = data.plongee.id;
    });

    it('devrait refuser une plongée sans titre', async () => {
      const res = await fetch(`${API_URL}/api/plongees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          date: '2024-01-15T10:00:00Z',
          profondeur: 25,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('devrait refuser sans authentification', async () => {
      const res = await fetch(`${API_URL}/api/plongees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: 'Test',
          date: '2024-01-15T10:00:00Z',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/plongees', () => {
    it('devrait récupérer toutes les plongées de l\'utilisateur', async () => {
      const res = await fetch(`${API_URL}/api/plongees`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.plongees)).toBe(true);
      expect(data.plongees.length).toBeGreaterThan(0);
      expect(data.plongees[0].titre).toBe('Test Plongée Marseille');
    });
  });
});

describe('Tests d\'intégration - Espèces', () => {
  describe('GET /api/especes', () => {
    it('devrait récupérer la liste des espèces avec pagination', async () => {
      const res = await fetch(`${API_URL}/api/especes?page=1&limit=12`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.especes)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(12);
      expect(data.totalPages).toBeDefined();
    });

    it('devrait filtrer les espèces par recherche', async () => {
      const res = await fetch(`${API_URL}/api/especes?search=blen&limit=12`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.especes)).toBe(true);
      // Vérifier que les résultats contiennent le terme recherché
      if (data.especes.length > 0) {
        expect(data.especes[0].nom.toLowerCase()).toContain('blen');
      }
    });
  });

  describe('POST /api/especes', () => {
    it('devrait créer une nouvelle espèce ou retourner l\'existante', async () => {
      const res = await fetch(`${API_URL}/api/especes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: 'Test Espèce Marine',
          image: 'https://example.com/image.jpg',
        }),
      });

      expect([200, 201]).toContain(res.status);
      const data = await res.json();
      expect(data.espece.nom).toBe('Test Espèce Marine');
      testEspeceId = data.espece.id;
    });
  });

  describe('POST /api/plongees/[id]/especes', () => {
    beforeAll(async () => {
      // S'assurer que l'espèce de test existe
      if (!testEspeceId) {
        const especeRes = await fetch(`${API_URL}/api/especes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: 'Test Espèce Marine',
            image: 'https://example.com/image.jpg',
          }),
        });
        const especeData = await especeRes.json();
        testEspeceId = especeData.espece.id;
      }
    });

    it('devrait ajouter une espèce à une plongée', async () => {
      const res = await fetch(`${API_URL}/api/plongees/${testPlongeeId}/especes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          id_espece: testEspeceId,
          nom: 'Test Espèce Marine',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toContain('succès');
    });

    it('devrait empêcher d\'ajouter la même espèce deux fois', async () => {
      const res = await fetch(`${API_URL}/api/plongees/${testPlongeeId}/especes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          id_espece: testEspeceId,
          nom: 'Test Espèce Marine',
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('déjà ajoutée');
    });
  });

  describe('GET /api/plongees/[id]/especes', () => {
    it('devrait récupérer toutes les espèces d\'une plongée', async () => {
      const res = await fetch(`${API_URL}/api/plongees/${testPlongeeId}/especes`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.especes)).toBe(true);
      expect(data.especes.length).toBeGreaterThan(0);
      expect(data.especes.some((e: any) => e.nom === 'Test Espèce Marine')).toBe(true);
    });
  });
});

describe('Tests d\'intégration - Administration', () => {
  beforeAll(async () => {
    // Créer un admin via la fonction createTestUser
    const uniquePseudo = `integtestadmin${Date.now()}`;
    const { userId, token } = await createTestUser(uniquePseudo, true);
    adminUserId = userId;
    adminToken = token;
    console.log('✅ Admin created:', uniquePseudo, 'ID:', adminUserId);
  });

  afterAll(async () => {
    // Nettoyer l'admin créé
    if (adminUserId) {
      await pool.query('DELETE FROM role WHERE id_utilisateur = $1', [adminUserId]);
      await pool.query('DELETE FROM utilisateur WHERE id = $1', [adminUserId]);
    }
  });

  describe('GET /api/admin/users', () => {
    it('devrait récupérer tous les utilisateurs (admin)', async () => {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès aux non-admins', async () => {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/[id]/block', () => {
    it('devrait bloquer un utilisateur', async () => {
      const res = await fetch(`${API_URL}/api/admin/users/${testUserId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ blocked: true }),
      });

      expect(res.status).toBe(200);

      // Vérifier que l'utilisateur est bloqué
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'integtestmain',
          password: 'Test123456',
        }),
      });
      expect(loginRes.status).toBe(403);
    });

    it('devrait débloquer un utilisateur', async () => {
      const res = await fetch(`${API_URL}/api/admin/users/${testUserId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ blocked: false }),
      });

      expect(res.status).toBe(200);

      // Vérifier que l'utilisateur peut se connecter
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'integtestmain',
          password: 'Test123456',
        }),
      });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('PATCH /api/admin/users/[id]/promote', () => {
    it('devrait promouvoir un utilisateur en admin', async () => {
      const res = await fetch(`${API_URL}/api/admin/users/${testUserId}/promote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ admin: true }),
      });

      expect(res.status).toBe(200);

      // Vérifier que l'utilisateur a accès aux routes admin
      const adminRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${testUserToken}` },
      });
      expect(adminRes.status).toBe(200);
    });
  });

  describe('DELETE /api/admin/users/[id]', () => {
    it('devrait supprimer un utilisateur', async () => {
      // Créer un utilisateur temporaire à supprimer
      const { userId } = await createTestUser('integtesttodelete', false);

      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);

      // Vérifier que l'utilisateur n'existe plus
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: 'integtesttodelete',
          password: 'Test123456',
        }),
      });
      expect(loginRes.status).toBe(401);
    });
  });
});

describe('Tests d\'intégration - Sécurité & Autorisations', () => {
  let otherUserId: string;
  let otherUserToken: string;
  let otherPlongeeId: string;

  beforeAll(async () => {
    const { userId, token } = await createTestUser('integtestother', false);
    otherUserId = userId;
    otherUserToken = token;

    // Créer une plongée pour cet utilisateur
    const res = await fetch(`${API_URL}/api/plongees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherUserToken}`,
      },
      body: JSON.stringify({
        titre: 'Test Plongée Autre Utilisateur',
        date: '2024-01-16T10:00:00Z',
        profondeur: 20,
        temps: 40,
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      otherPlongeeId = data.plongee?.id;
    }
  });

  afterAll(async () => {
    // Nettoyer les données créées
    if (otherPlongeeId) {
      await pool.query('DELETE FROM plongee_espece WHERE id_plongee = $1', [otherPlongeeId]);
      await pool.query('DELETE FROM plongee WHERE id = $1', [otherPlongeeId]);
    }
    if (otherUserId) {
      await pool.query('DELETE FROM role WHERE id_utilisateur = $1', [otherUserId]);
      await pool.query('DELETE FROM utilisateur WHERE id = $1', [otherUserId]);
    }
  });

  it('ne devrait pas permettre d\'ajouter des espèces à la plongée d\'un autre', async () => {
    const res = await fetch(`${API_URL}/api/plongees/${otherPlongeeId}/especes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        id_espece: testEspeceId,
        nom: 'Test Espèce Marine',
      }),
    });

    expect(res.status).toBe(404);
  });

  it('ne devrait voir que ses propres plongées', async () => {
    const res = await fetch(`${API_URL}/api/plongees`, {
      headers: { 'Authorization': `Bearer ${otherUserToken}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    
    // Vérifier que toutes les plongées appartiennent à cet utilisateur
    const hasOtherUserPlongees = data.plongees.some(
      (p: any) => p.titre === 'Test Plongée Marseille'
    );
    expect(hasOtherUserPlongees).toBe(false);
  });
});

describe('Tests d\'intégration - Cascade & Relations', () => {
  it('devrait supprimer les plongées quand on supprime un utilisateur', async () => {
    // Créer un utilisateur temporaire avec une plongée
    const { userId, token } = await createTestUser('integtesttodelete2', false);
    
    const plongeeRes = await fetch(`${API_URL}/api/plongees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        titre: 'Test Cascade Delete',
        date: '2024-01-17T10:00:00Z',
      }),
    });
    
    let plongeeId;
    if (plongeeRes.ok) {
      const plongeeData = await plongeeRes.json();
      plongeeId = plongeeData.plongee?.id;
    }

    // Supprimer directement l'utilisateur dans la DB pour tester le CASCADE
    await pool.query('DELETE FROM utilisateur WHERE id = $1', [userId]);
    
    // Attendre que la cascade soit effective
    await new Promise(resolve => setTimeout(resolve, 100));

    // Vérifier que la plongée n'existe plus si elle avait été créée
    if (plongeeId) {
      const checkPlongee = await pool.query(
        'SELECT * FROM plongee WHERE id = $1',
        [plongeeId]
      );
      expect(checkPlongee.rows.length).toBe(0);
    }
  });
});
