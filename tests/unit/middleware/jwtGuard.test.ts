import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateToken, createAuthGuard } from '@/modules/auth/guard';

function createMockJwt(validToken: string = 'valid-token') {
  return {
    sign: vi.fn().mockResolvedValue('signed-token'),
    verify: vi.fn(async (token: string) => {
      return token === validToken ? { user: 'test' } : null;
    }),
  };
}

describe('validateToken (pure function)', () => {
  let blacklist: Set<string>;
  let mockJwt: ReturnType<typeof createMockJwt>;

  beforeEach(() => {
    vi.clearAllMocks();
    blacklist = new Set();
    mockJwt = createMockJwt();
  });

  it('returns error when token is undefined', async () => {
    const result = await validateToken(undefined, blacklist, mockJwt);

    expect(result).toEqual({ error: 'Unauthorized: Token not provided', status: 401 });
  });

  it('returns error when token is blacklisted', async () => {
    blacklist.add('blacklisted-token');

    const result = await validateToken('blacklisted-token', blacklist, mockJwt);

    expect(result).toEqual({ error: 'Unauthorized: Token is blacklisted', status: 401 });
  });

  it('returns error when jwt.verify returns null (invalid token)', async () => {
    const result = await validateToken('invalid-token', blacklist, mockJwt);

    expect(mockJwt.verify).toHaveBeenCalledWith('invalid-token');
    expect(result).toEqual({ error: 'Unauthorized: Invalid token', status: 401 });
  });

  it('returns token and payload when token is valid', async () => {
    const result = await validateToken('valid-token', blacklist, mockJwt);

    expect(mockJwt.verify).toHaveBeenCalledWith('valid-token');
    expect(result).toEqual({ token: 'valid-token', payload: { user: 'test' } });
  });
});

describe('createAuthGuard (middleware)', () => {
  let blacklist: Set<string>;
  let mockJwt: ReturnType<typeof createMockJwt>;

  beforeEach(() => {
    vi.clearAllMocks();
    blacklist = new Set();
    mockJwt = createMockJwt();
  });

  it('returns undefined when token is valid', async () => {
    const guard = createAuthGuard(blacklist);
    const request = new Request('http://localhost', {
      headers: { authorization: 'Bearer valid-token' },
    });
    const status = vi.fn() as any;

    const result = await guard({ request, jwt: mockJwt, status });

    expect(result).toBeUndefined();
    expect(status).not.toHaveBeenCalled();
  });

  it('returns 401 when no Authorization header', async () => {
    const guard = createAuthGuard(blacklist);
    const request = new Request('http://localhost');
    const status = vi.fn() as any;

    await guard({ request, jwt: mockJwt, status });

    expect(status).toHaveBeenCalledWith(401, {
      success: false,
      message: 'Unauthorized: Token not provided',
    });
  });

  it('returns 401 when token is blacklisted', async () => {
    blacklist.add('revoked');
    const guard = createAuthGuard(blacklist);
    const request = new Request('http://localhost', {
      headers: { authorization: 'Bearer revoked' },
    });
    const status = vi.fn() as any;

    await guard({ request, jwt: mockJwt, status });

    expect(status).toHaveBeenCalledWith(401, {
      success: false,
      message: 'Unauthorized: Token is blacklisted',
    });
  });

  it('returns 401 when token is invalid', async () => {
    const guard = createAuthGuard(blacklist);
    const request = new Request('http://localhost', {
      headers: { authorization: 'Bearer bad-token' },
    });
    const status = vi.fn() as any;

    await guard({ request, jwt: mockJwt, status });

    expect(status).toHaveBeenCalledWith(401, {
      success: false,
      message: 'Unauthorized: Invalid token',
    });
  });
});
