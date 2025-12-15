import { hashPassword, comparePassword, generateToken, verifyToken } from './auth';

describe('Auth Utils', () => {
  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      
      const isValid = await comparePassword('wrongPassword', hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid token', () => {
      const token = generateToken('uuid-123', 'testuser');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify valid token', () => {
      const token = generateToken('uuid-123', 'testuser');
      const decoded = verifyToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe('uuid-123');
      expect(decoded?.pseudo).toBe('testuser');
    });

    it('should reject invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });
});
