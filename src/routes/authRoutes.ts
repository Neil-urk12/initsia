import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "../services/authService";
import { InMemoryTokenBlacklist } from "../services/tokenBlacklist";
import { authMiddlewarePlugin } from "../middlewares/authMiddleware";
import {
  InvalidCredentialsError,
  UserNotFoundError,
  EmailExistsError,
  UsernameExistsError,
} from "../types/authErrors";

const tokenBlacklist = new InMemoryTokenBlacklist();
const authService = new AuthService(
  (await import("../repository/userRepository")).default,
  tokenBlacklist,
);

const authRoutes = new Elysia({ prefix: "/user" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "default_secret_key",
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
  });

// Public routes
const unprotectedRoutes = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "default_secret_key",
    }),
  )
  .post("/register", async ({ body, status }) => {
    const result = await authService.register(body as any);
    return status(201, { success: true, ...result });
  })
  .post("/login", async ({ body, jwt, status }) => {
    const result = await authService.login(body as any);
    const token = await jwt.sign({ user: result.user });
    return { access_token: token, ...result };
  });

// Protected routes
const protectedRoutes = new Elysia()
  .use(authMiddlewarePlugin(tokenBlacklist))
  .post("/logout", async ({ headers, status }) => {
    const token = headers.authorization?.split(" ")[1];
    if (!token) {
      return status(400, { success: false, message: "Token not provided" });
    }
    authService.logout(token);
    return { success: true, message: "Logged out successfully" };
  });

authRoutes.use(unprotectedRoutes).use(protectedRoutes);

export default authRoutes;
