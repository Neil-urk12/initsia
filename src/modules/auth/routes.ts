import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import type { AuthService } from "./service";
import type { createJWTMiddleware } from "./middleware";
import {
  InvalidCredentialsError,
  UserNotFoundError,
  EmailExistsError,
  UsernameExistsError,
} from "./errors";

export function createAuthRoutes(
  authService: AuthService,
  jwtGuard: ReturnType<typeof createJWTMiddleware>,
) {
  const JWT_SECRET = Bun.env.JWT_SECRET || "default_secret_key";

  return new Elysia({ prefix: "/user" })
    .use(
      jwt({
        name: "jwt",
        secret: JWT_SECRET,
      }),
    )
    .error({
      InvalidCredentialsError,
      UserNotFoundError,
      EmailExistsError,
      UsernameExistsError,
    })
    .onError(({ code, error, status }) => {
      switch (code) {
        case "InvalidCredentialsError":
          return status(401, { success: false, message: error.message });
        case "UserNotFoundError":
          return status(404, { success: false, message: error.message });
        case "EmailExistsError":
        case "UsernameExistsError":
          return status(409, { success: false, message: error.message });
        default:
          return status(500, { success: false, message: "Internal server error" });
      }
    })
    // Public routes
    .post("/register", async ({ body, status }) => {
      const result = await authService.register(body as any);
      return status(201, { success: true, ...result });
    })
    .post("/login", async ({ body, jwt, status }) => {
      const result = await authService.login(body as any);
      const token = await jwt.sign({ user: result.user });
      return { access_token: token, ...result };
    })
    // Protected routes
    .guard(
      { beforeHandle: jwtGuard },
      (app) =>
        app.post("/logout", async ({ headers, status }) => {
          const token = headers.authorization?.split(" ")[1];
          if (!token) {
            return status(400, { success: false, message: "Token not provided" });
          }
          authService.logout(token);
          return { success: true, message: "Logged out successfully" };
        }),
    );
}
