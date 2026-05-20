import type { DatabasePool } from "../../config/database/IDatabaseAdapter";
import { UserRepository } from "../user/repository";
import { UserService } from "../user/service";
import { AuthService } from "./service";
import { InMemoryTokenBlacklist } from "./blacklist";
import { createJWTMiddleware } from "./middleware";
import { createAuthRoutes } from "./routes";

export function createAuthModule(pool: DatabasePool) {
  const tokenBlacklist = new InMemoryTokenBlacklist();
  const userRepo = new UserRepository(pool);
  const userService = new UserService(userRepo);
  const authService = new AuthService(userService, tokenBlacklist);
  const jwtGuard = createJWTMiddleware(tokenBlacklist);

  return createAuthRoutes(authService, jwtGuard);
}