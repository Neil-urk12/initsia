import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { UserRepository } from "../user/repository";
import { UserService } from "../user/service";
import { getDbPool } from "../../config/db_config";
import { AuthService, InMemoryTokenBlacklist } from "./service";
import {
  InvalidCredentialsError,
  UserNotFoundError,
  EmailExistsError,
  UsernameExistsError,
} from "./errors";

// Composition: wire dependencies here
const tokenBlacklist = new InMemoryTokenBlacklist();
const pool = await getDbPool();
const userRepo = new UserRepository(pool);
const userService = new UserService(userRepo);
const authService = new AuthService(userService, tokenBlacklist);

const JWT_SECRET = Bun.env.JWT_SECRET || "default_secret_key";

// Auth module — Elysia instance as controller
export const auth = new Elysia({ prefix: "/user" })
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
  // Protected routes — inline middleware as scoped onBeforeHandle
  .onBeforeHandle(async ({ request, jwt, set }) => {
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
  })
  .post("/logout", async ({ headers, status }) => {
    const token = headers.authorization?.split(" ")[1];
    if (!token) {
      return status(400, { success: false, message: "Token not provided" });
    }
    authService.logout(token);
    return { success: true, message: "Logged out successfully" };
  });

export default auth;
