import { NextRequest } from 'next/server';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { QueryResult, QueryResultRow } from 'pg';

// Mock du pool de base de données
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

const mockPool = pool as jest.Mocked<typeof pool> & {
  query: jest.MockedFunction<(...args: unknown[]) => Promise<QueryResult<QueryResultRow>>>;
};

describe('Auth API - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('retourne un token pour des identifiants valides', async () => {
      const hashedPassword = await hashPassword('password123');
      
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          pseudo: 'john_doe',
          mot_de_passe: hashedPassword,
          nom: 'Doe',
          prenom: 'John',
          photo_profil: null,
          blocked: false,
          admin: false,
        }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: 'john_doe',
          password: 'password123',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.pseudo).toBe('john_doe');
      expect(data.user.admin).toBe(false);
    });

    it('retourne 401 pour un utilisateur inexistant', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: 'nonexistent',
          password: 'password123',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Pseudo ou mot de passe incorrect');
    });

    it('retourne 401 pour un mot de passe incorrect', async () => {
      const hashedPassword = await hashPassword('correctPassword');
      
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          pseudo: 'john_doe',
          mot_de_passe: hashedPassword,
          nom: 'Doe',
          prenom: 'John',
          photo_profil: null,
          blocked: false,
          admin: false,
        }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: 'john_doe',
          password: 'wrongPassword',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Pseudo ou mot de passe incorrect');
    });

    it('retourne 403 pour un utilisateur bloqué', async () => {
      const hashedPassword = await hashPassword('password123');
      
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          pseudo: 'blocked_user',
          mot_de_passe: hashedPassword,
          nom: 'Blocked',
          prenom: 'User',
          photo_profil: null,
          blocked: true,
          admin: false,
        }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: 'blocked_user',
          password: 'password123',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('bloqué');
    });

    it('retourne 400 pour des données invalides', async () => {
      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: '',
          password: '',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('invalides');
    });

    it('retourne 400 si des champs manquent', async () => {
      const request = new NextRequest('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          pseudo: 'john_doe',
        }),
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('invalides');
    });
  });
});
