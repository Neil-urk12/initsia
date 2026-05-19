import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock db_config to prevent Bun.env access during module loading
vi.mock('@/config/db_config', async () => {
  const mockPool = { execute: vi.fn() };
  return {
    default: {
      getDbPool: vi.fn().mockResolvedValue(mockPool),
      testDbConnection: vi.fn().mockResolvedValue(undefined),
    },
    pool: mockPool,
  };
});
import { AuthService } from '@/services/authService';
import { IUserRepository } from '@/repository/IUserRepository';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn(),
}));

function createMockRepo(): IUserRepository {
  return {
    findUserById: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByUsername: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    findUsers: vi.fn(),
  };
}

describe('AuthService', () => {
  let mockRepo: IUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = createMockRepo();
    authService = new AuthService(mockRepo);
  });

  describe('register', () => {
    const newUser = { username: 'test', email: 't@t.com', password: 'Pass1!', first_name: 'T', last_name: 'U' };

    it('creates user and returns it', async () => {
      const created = {
        user_id: 'u1',
        username: 'test',
        email: 't@t.com',
        first_name: 'T',
        last_name: 'U',
        password_hash: 'hashed_password',
        roles: ['user'],
      };
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(null);
      vi.mocked(mockRepo.createUser!).mockResolvedValue(created);

      const result = await authService.register(newUser);

      expect(result).toEqual({ user: expect.objectContaining({ username: 'test' }) });
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'test', password_hash: 'hashed_password' })
      );
    });

    it('throws if email exists', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue({ user_id: 'existing' } as any);
      await expect(authService.register(newUser)).rejects.toThrow(/already exists|registered/i);
    });

    it('throws if username exists', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue({ user_id: 'existing' } as any);
      await expect(authService.register(newUser)).rejects.toThrow(/already exists/i);
    });
  });

  describe('login', () => {
    it('returns user on valid credentials', async () => {
      const user = { user_id: 'u1', username: 'test', password_hash: '$2b$10$hash', roles: ['user'] };
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(user as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await authService.login({ identifier: 't@t.com', password: 'Pass1!' });

      expect(result).toEqual({ user: expect.objectContaining({ user_id: 'u1' }) });
    });

    it('throws if user not found', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(null);

      await expect(authService.login({ identifier: 'unknown', password: 'x' })).rejects.toThrow(/not found/i);
    });

    it('throws on wrong password', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue({ user_id: 'u1', password_hash: '$2b$10$hash' } as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(false);
      await expect(authService.login({ identifier: 't@t.com', password: 'wrong' })).rejects.toThrow(/invalid/i);
    });

    it('finds user by username when identifier is not email', async () => {
      const user = { user_id: 'u1', username: 'testuser', password_hash: '$2b$10$hash', roles: ['user'] };
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(user as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await authService.login({ identifier: 'testuser', password: 'Pass1!' });

      expect(result).toEqual({ user: expect.objectContaining({ username: 'testuser' }) });
      expect(mockRepo.findUserByUsername).toHaveBeenCalled();
    });
  });
});