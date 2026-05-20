import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ITokenBlacklist } from '@/modules/auth/service';
import { createJWTMiddleware } from '@/modules/auth/middleware';

function createMockBlacklist(tokens: Set<string> = new Set()): ITokenBlacklist {
  return {
    add: vi.fn(),
    has: vi.fn((token: string) => tokens.has(token)),
  };
}

function createMockJwt(validToken: string = 'valid-token') {
  return {
    sign: vi.fn().mockResolvedValue('signed-token'),
    verify: vi.fn(async (token: string) => {
      return token === validToken ? { user: 'test' } : null;
    }),
  };
}

function createMockSet() {
  return { status: 200 };
}

function createRequestWithToken(token?: string): Request {
  const headers: Record<string, string> = {};
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  return new Request('http://localhost', { headers });
}

describe('JWT Middleware (createJWTMiddleware)', () => {
  let mockBlacklist: ITokenBlacklist;
  let mockJwt: ReturnType<typeof createMockJwt>;
  let mockSet: ReturnType<typeof createMockSet>;
  let middleware: ReturnType<typeof createJWTMiddleware>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBlacklist = createMockBlacklist();
    mockJwt = createMockJwt();
    mockSet = createMockSet();
    middleware = createJWTMiddleware(mockBlacklist);
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const request = createRequestWithToken();

    const result = await middleware({ request, jwt: mockJwt, set: mockSet });

    expect(mockSet.status).toBe(401);
    expect(result).toBe('Unauthorized: Token not provided');
  });

  it('returns 401 when token is in the blacklist', async () => {
    const blacklistedTokens = new Set(['blacklisted-token']);
    mockBlacklist = createMockBlacklist(blacklistedTokens);
    middleware = createJWTMiddleware(mockBlacklist);

    const request = createRequestWithToken('blacklisted-token');

    const result = await middleware({ request, jwt: mockJwt, set: mockSet });

    expect(mockSet.status).toBe(401);
    expect(result).toBe('Unauthorized: Token is blacklisted');
  });

  it('returns 401 when jwt.verify returns null (invalid token)', async () => {
    const request = createRequestWithToken('invalid-token');

    const result = await middleware({ request, jwt: mockJwt, set: mockSet });

    expect(mockJwt.verify).toHaveBeenCalledWith('invalid-token');
    expect(mockSet.status).toBe(401);
    expect(result).toBe('Unauthorized: Invalid token');
  });

  it('returns undefined when token is valid and not blacklisted', async () => {
    const request = createRequestWithToken('valid-token');

    const result = await middleware({ request, jwt: mockJwt, set: mockSet });

    expect(mockJwt.verify).toHaveBeenCalledWith('valid-token');
    expect(mockSet.status).toBe(200); // unchanged
    expect(result).toBeUndefined();
  });
});
