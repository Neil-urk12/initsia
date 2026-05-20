import type { ITokenBlacklist } from "./service";

export function createJWTMiddleware(tokenBlacklist: ITokenBlacklist) {
  return async function jwtGuard({
    request,
    jwt,
    set,
  }: {
    request: Request;
    jwt: any;
    set: any;
  }) {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      set.status = 401;
      return "Unauthorized: Token not provided";
    }

    if (tokenBlacklist.has(token)) {
      set.status = 401;
      return "Unauthorized: Token is blacklisted";
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return "Unauthorized: Invalid token";
    }
  };
}
