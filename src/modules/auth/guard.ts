export async function validateToken(
  token: string | undefined,
  blacklist: Set<string>,
  jwt: any,
): Promise<{ token: string; payload: any } | { error: string; status: number }> {
  if (!token) {
    return { error: "Unauthorized: Token not provided", status: 401 };
  }

  if (blacklist.has(token)) {
    return { error: "Unauthorized: Token is blacklisted", status: 401 };
  }

  const payload = await jwt.verify(token);

  if (!payload) {
    return { error: "Unauthorized: Invalid token", status: 401 };
  }

  return { token, payload };
}

export function createAuthGuard(blacklist: Set<string>) {
  return async function jwtGuard({
    request,
    jwt,
    status,
  }: {
    request: Request;
    jwt: any;
    set: any;
    status: (code: number, response?: any) => never;
  }) {
    const token = request.headers.get("authorization")?.split(" ")[1];
    const result = await validateToken(token, blacklist, jwt);

    if ("error" in result) {
      return status(result.status, { success: false, message: result.error });
    }
  };
}