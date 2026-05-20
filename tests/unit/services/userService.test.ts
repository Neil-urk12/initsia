import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock db_config to prevent Bun.env access during module loading
vi.mock('@/config/db_config', () => ({
  getDbPool: vi.fn().mockResolvedValue({ execute: vi.fn() }),
  testDbConnection: vi.fn().mockResolvedValue(undefined),
}));
import { UserService } from '@/modules/user/service';
import { IUserRepository } from '@/modules/user/repository';
import {
  EmailExistsError,
  UsernameExistsError,
} from '@/modules/user/errors';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid'),
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

describe('UserService', () => {
  let mockRepo: IUserRepository;
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = createMockRepo();
    userService = new UserService(mockRepo);
  });

  describe('register', () => {
    const newUserData = { username: 'test', email: 't@t.com', password: 'Pass1!', first_name: 'T', last_name: 'U', roles: ['user'] };

    it('creates user and returns PublicUser', async () => {
      const created = {
        user_id: 'mock-uuid',
        username: 'test',
        email: 't@t.com',
        first_name: 'T',
        last_name: 'U',
        password_hash: 'hashed_password',
        roles: ['user'],
        created_at: new Date(),
      };
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(null);
      vi.mocked(mockRepo.createUser!).mockResolvedValue(created);

      const result = await userService.register(newUserData);

      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'test', password_hash: 'hashed_password', user_id: 'mock-uuid' })
      );
      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('created_at');
      expect(result.username).toBe('test');
    });

    it('throws EmailExistsError if email exists', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue({ user_id: 'existing' } as any);
      await expect(userService.register(newUserData)).rejects.toThrow(EmailExistsError);
    });

    it('throws UsernameExistsError if username exists', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue({ user_id: 'existing' } as any);
      await expect(userService.register(newUserData)).rejects.toThrow(UsernameExistsError);
    });

    it('hashes password with bcrypt', async () => {
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(null);
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(null);
      vi.mocked(mockRepo.createUser!).mockResolvedValue({ user_id: 'u1' } as any);
      const bcrypt = await import('bcrypt');

      await userService.register(newUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass1!', 10);
    });
  });

  describe('findById', () => {
    it('returns PublicUser when found', async () => {
      const user = { user_id: 'u1', username: 'test', email: 't@t.com', password_hash: 'hash', created_at: new Date() };
      vi.mocked(mockRepo.findUserById!).mockResolvedValue(user as any);

      const result = await userService.findById('u1');

      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('created_at');
      expect(result!.user_id).toBe('u1');
    });

    it('returns null when not found', async () => {
      vi.mocked(mockRepo.findUserById!).mockResolvedValue(null);
      expect(await userService.findById('missing')).toBeNull();
    });
  });

  describe('findForAuthByEmail', () => {
    it('returns full User with hash', async () => {
      const user = { user_id: 'u1', password_hash: 'hash', created_at: new Date() };
      vi.mocked(mockRepo.findUserByEmail!).mockResolvedValue(user as any);

      const result = await userService.findForAuthByEmail('t@t.com');

      expect(result).toBe(user); // returns raw user, not stripped
    });
  });

  describe('findForAuthByUsername', () => {
    it('returns full User with hash', async () => {
      const user = { user_id: 'u1', password_hash: 'hash', created_at: new Date() };
      vi.mocked(mockRepo.findUserByUsername!).mockResolvedValue(user as any);

      const result = await userService.findForAuthByUsername('testuser');

      expect(result).toBe(user);
    });
  });
});
