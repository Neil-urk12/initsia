import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, ITokenBlacklist } from '@/modules/auth/service';
import { IUserService } from '@/modules/user/service';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/modules/user/errors';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn(),
}));

function createMockUserService(): IUserService {
  return {
    register: vi.fn(),
    findById: vi.fn(),
    findForAuthByEmail: vi.fn(),
    findForAuthByUsername: vi.fn(),
  };
}

function createMockBlacklist(): ITokenBlacklist {
  return {
    add: vi.fn(),
    has: vi.fn().mockReturnValue(false),
  };
}

describe('AuthService', () => {
  let mockUserService: IUserService;
  let mockBlacklist: ITokenBlacklist;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserService = createMockUserService();
    mockBlacklist = createMockBlacklist();
    authService = new AuthService(mockUserService, mockBlacklist);
  });

  describe('register', () => {
    const newUser = { username: 'test', email: 't@t.com', password: 'Pass1!', first_name: 'T', last_name: 'U', roles: ['user'] };

    it('delegates to userService.register', async () => {
      const publicUser = { user_id: 'u1', username: 'test', email: 't@t.com', first_name: 'T', last_name: 'U', roles: ['user'] };
      vi.mocked(mockUserService.register).mockResolvedValue(publicUser);

      const result = await authService.register(newUser);

      expect(mockUserService.register).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ user: publicUser });
    });
  });

  describe('login', () => {
    it('returns user on valid email credentials', async () => {
      const user = { user_id: 'u1', username: 'test', email: 't@t.com', first_name: 'T', last_name: 'U', password_hash: '$2b$10$hash', roles: ['user'], created_at: new Date() };
      vi.mocked(mockUserService.findForAuthByEmail).mockResolvedValue(user as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await authService.login({ identifier: 't@t.com', password: 'Pass1!' });

      expect(mockUserService.findForAuthByEmail).toHaveBeenCalledWith('t@t.com');
      expect(result.user.user_id).toBe('u1');
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('throws UserNotFoundError if user not found', async () => {
      vi.mocked(mockUserService.findForAuthByEmail).mockResolvedValue(null);

      await expect(authService.login({ identifier: 'unknown@t.com', password: 'x' })).rejects.toThrow(UserNotFoundError);
    });

    it('throws InvalidCredentialsError on wrong password', async () => {
      const user = { user_id: 'u1', password_hash: '$2b$10$hash', created_at: new Date() };
      vi.mocked(mockUserService.findForAuthByEmail).mockResolvedValue(user as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      await expect(authService.login({ identifier: 't@t.com', password: 'wrong' })).rejects.toThrow(InvalidCredentialsError);
    });

    it('finds user by username when identifier is not email', async () => {
      const user = { user_id: 'u1', username: 'testuser', password_hash: '$2b$10$hash', roles: ['user'], created_at: new Date() };
      vi.mocked(mockUserService.findForAuthByUsername).mockResolvedValue(user as any);
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await authService.login({ identifier: 'testuser', password: 'Pass1!' });

      expect(mockUserService.findForAuthByUsername).toHaveBeenCalledWith('testuser');
      expect(result.user.username).toBe('testuser');
    });
  });

  describe('logout', () => {
    it('adds token to blacklist', () => {
      authService.logout('some-token');
      expect(mockBlacklist.add).toHaveBeenCalledWith('some-token');
    });
  });

  describe('isTokenBlacklisted', () => {
    it('delegates to blacklist', () => {
      vi.mocked(mockBlacklist.has).mockReturnValue(true);
      expect(authService.isTokenBlacklisted('token')).toBe(true);
      expect(mockBlacklist.has).toHaveBeenCalledWith('token');
    });
  });
});
