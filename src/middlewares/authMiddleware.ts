import { Elysia, Context } from "elysia";
import { JWTPayloadSpec } from "@elysiajs/jwt";


export const authMiddlewarePlugin =
  (tokenBlacklist: Set<string>) => (app: Elysia) =>
    app.onBeforeHandle(async (context: Context) => {
      const { jwt, request, set } = context as any;

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


    });
