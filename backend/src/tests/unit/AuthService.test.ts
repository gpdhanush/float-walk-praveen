import { jest } from '@jest/globals';
import { AuthService } from '../../application/services/AuthService.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';

describe('AuthService', () => {
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@test.com',
    passwordHash: '$2b$12$dummy',
    name: 'Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserRepo: IUserRepository = {
    findById: jest.fn().mockResolvedValue(mockUser) as IUserRepository['findById'],
    findByEmail: jest.fn().mockResolvedValue(mockUser) as IUserRepository['findByEmail'],
    findMany: jest.fn() as IUserRepository['findMany'],
    create: jest.fn() as IUserRepository['create'],
    update: jest.fn() as IUserRepository['update'],
    softDelete: jest.fn() as IUserRepository['softDelete'],
  };

  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUserRepo);
  });

  describe('validatePassword', () => {
    it('throws when password is too short', () => {
      expect(() => authService.validatePassword('Short1!')).toThrow();
    });

    it('throws when password lacks required character types', () => {
      expect(() => authService.validatePassword('nouppercase1!')).toThrow();
      expect(() => authService.validatePassword('NOLOWERCASE1!')).toThrow();
      expect(() => authService.validatePassword('NoNumbers!')).toThrow();
      expect(() => authService.validatePassword('NoSpecial1')).toThrow();
    });

    it('accepts valid password', () => {
      expect(() => authService.validatePassword('ValidPass1!')).not.toThrow();
    });
  });

  describe('login', () => {
    it('returns user and tokens when credentials are valid', async () => {
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('password123!', 12);
      (mockUserRepo.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash: hash,
      });

      const result = await authService.login('admin@test.com', 'password123!');

      expect(result.user.email).toBe('admin@test.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it('throws when user not found', async () => {
      (mockUserRepo.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('unknown@test.com', 'password123!')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        statusCode: 401,
      });
    });
  });

  describe('generateAccessToken / verifyAccessToken', () => {
    it('generates and verifies access token', async () => {
      (mockUserRepo.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      const token = authService.generateAccessToken(mockUser);
      const payload = authService.verifyAccessToken(token);
      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.type).toBe('access');
    });

    it('throws on invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid')).toThrow();
    });
  });
});
