import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
} from '../validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('valide un objet correct', () => {
      const validData: RegisterInput = {
        pseudo: 'john_doe',
        password: 'password123',
        nom: 'Doe',
        prenom: 'John',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('valide avec photo_profil optionnelle', () => {
      const validData = {
        pseudo: 'john_doe',
        password: 'password123',
        nom: 'Doe',
        prenom: 'John',
        photo_profil: 'https://example.com/photo.jpg',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejette un pseudo trop court', () => {
      const invalidData = {
        pseudo: 'ab',
        password: 'password123',
        nom: 'Doe',
        prenom: 'John',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 3 caractères');
      }
    });

    it('rejette un mot de passe trop court', () => {
      const invalidData = {
        pseudo: 'john_doe',
        password: '12345',
        nom: 'Doe',
        prenom: 'John',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 6 caractères');
      }
    });

    it('rejette un nom trop court', () => {
      const invalidData = {
        pseudo: 'john_doe',
        password: 'password123',
        nom: 'D',
        prenom: 'John',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères');
      }
    });

    it('rejette un prénom trop court', () => {
      const invalidData = {
        pseudo: 'john_doe',
        password: 'password123',
        nom: 'Doe',
        prenom: 'J',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères');
      }
    });

    it('rejette si des champs manquent', () => {
      const invalidData = {
        pseudo: 'john_doe',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('valide un objet correct', () => {
      const validData: LoginInput = {
        pseudo: 'john_doe',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejette un pseudo vide', () => {
      const invalidData = {
        pseudo: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requis');
      }
    });

    it('rejette un mot de passe vide', () => {
      const invalidData = {
        pseudo: 'john_doe',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requis');
      }
    });
  });

  describe('updateProfileSchema', () => {
    it('valide un objet vide (tous les champs sont optionnels)', () => {
      const validData: UpdateProfileInput = {};

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('valide avec pseudo uniquement', () => {
      const validData: UpdateProfileInput = {
        pseudo: 'new_pseudo',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('valide avec nom et prenom', () => {
      const validData: UpdateProfileInput = {
        nom: 'Nouveau',
        prenom: 'Prénom',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('valide avec photo_profil null', () => {
      const validData: UpdateProfileInput = {
        photo_profil: null,
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejette un pseudo trop court', () => {
      const invalidData = {
        pseudo: 'ab',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 3 caractères');
      }
    });

    it('rejette un nom trop court', () => {
      const invalidData = {
        nom: 'A',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères');
      }
    });

    it('rejette un prénom trop court', () => {
      const invalidData = {
        prenom: 'B',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères');
      }
    });
  });
});
