import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock db_config to prevent Bun.env access during module loading
vi.mock('@/config/db_config', () => ({
  getDbPool: vi.fn().mockResolvedValue({ execute: vi.fn() }),
  testDbConnection: vi.fn().mockResolvedValue(undefined),
}));

import { UserRepository } from '@/modules/user/repository';

const mockPool = { execute: vi.fn() } as any;
const repo = new UserRepository(mockPool);

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findUserById', () => {
    it('returns user when found', async () => {
      const mockUser = { user_id: '1', username: 'test', email: 'test@test.com' };
      mockPool.execute.mockResolvedValue([[mockUser]]);

      const result = await repo.findUserById('1');

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE user_id = ?', ['1']);
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const result = await repo.findUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('returns user when found', async () => {
      const mockUser = { user_id: '1', email: 'test@test.com' };
      mockPool.execute.mockResolvedValue([[mockUser]]);

      const result = await repo.findUserByEmail('test@test.com');

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?', ['test@test.com']);
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      mockPool.execute.mockResolvedValue([[]]);
      expect(await repo.findUserByEmail('missing@test.com')).toBeNull();
    });
  });

  describe('findUserByUsername', () => {
    it('returns user when found', async () => {
      const mockUser = { user_id: '1', username: 'testuser' };
      mockPool.execute.mockResolvedValue([[mockUser]]);

      const result = await repo.findUserByUsername('testuser');

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      mockPool.execute.mockResolvedValue([[]]);
      expect(await repo.findUserByUsername('nouser')).toBeNull();
    });
  });

  describe('createUser', () => {
    it('creates and returns the new user', async () => {
      const newUser = {
        user_id: 'uuid-123',
        username: 'newuser',
        first_name: 'New',
        last_name: 'User',
        email: 'new@test.com',
        password_hash: 'hash123',
        roles: ['user'],
      };
      const createdUser = { ...newUser, roles: ['user'] };
      mockPool.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[createdUser]]);

      const result = await repo.createUser(newUser);

      expect(mockPool.execute).toHaveBeenNthCalledWith(
        1,
        'INSERT INTO users (user_id, username, first_name, last_name, email, password_hash, roles) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['uuid-123', 'newuser', 'New', 'User', 'new@test.com', 'hash123', '["user"]']
      );
      expect(mockPool.execute).toHaveBeenNthCalledWith(
        2,
        'SELECT * FROM users WHERE user_id = ?',
        ['uuid-123']
      );
      expect(result).toEqual(createdUser);
    });

    it('returns null if creation fails', async () => {
      mockPool.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[]]);

      const result = await repo.createUser({
        user_id: 'uuid-456',
        username: 'failuser',
        first_name: '',
        last_name: '',
        email: 'fail@test.com',
        password_hash: 'hash',
        roles: [],
      });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates only provided fields', async () => {
      const update = { user_id: '1', username: 'updated', first_name: 'Updated' };
      const updatedUser = { user_id: '1', username: 'updated', first_name: 'Updated', email: 'old@test.com' };
      mockPool.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[updatedUser]]);

      const result = await repo.updateUser(update);

      expect(mockPool.execute).toHaveBeenNthCalledWith(
        1,
        'UPDATE users SET username = ?, first_name = ? WHERE user_id = ?',
        ['updated', 'Updated', '1']
      );
      expect(result).toEqual(updatedUser);
    });

    it('handles roles field JSON serialization', async () => {
      const update = { user_id: '1', roles: ['admin', 'user'] };
      const updatedUser = { user_id: '1', roles: ['admin', 'user'] };
      mockPool.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[updatedUser]]);

      await repo.updateUser(update);

      expect(mockPool.execute).toHaveBeenNthCalledWith(
        1,
        'UPDATE users SET roles = ? WHERE user_id = ?',
        ['["admin","user"]', '1']
      );
    });
  });

  describe('findUsers', () => {
    it('returns all users when no criteria', async () => {
      const users = [{ user_id: '1' }, { user_id: '2' }];
      mockPool.execute.mockResolvedValue([users]);

      const result = await repo.findUsers({});

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users ', []);
      expect(result).toEqual(users);
    });

    it('filters by criteria', async () => {
      const users = [{ user_id: '1', first_name: 'John' }];
      mockPool.execute.mockResolvedValue([users]);

      const result = await repo.findUsers({ first_name: 'John', last_name: 'Doe' });

      expect(mockPool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE first_name = ? AND last_name = ?',
        ['John', 'Doe']
      );
      expect(result).toEqual(users);
    });
  });
});