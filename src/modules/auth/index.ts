import type { DatabasePool } from "../../config/database/IDatabaseAdapter";
import { UserRepository } from "../user/repository";
import { UserService } from "../user/service";
import { AuthService } from "./service";
import { createAuthGuard } from "./guard";
import { createAuthRoutes } from "./routes";

export function createAuthModule(pool: DatabasePool) {
  const blacklist = new Set<string>();
  const userRepo = new UserRepository(pool);
  const userService = new UserService(userRepo);
  const authService = new AuthService(userService);
  const guard = createAuthGuard(blacklist);

  return createAuthRoutes(authService, guard, blacklist);
}