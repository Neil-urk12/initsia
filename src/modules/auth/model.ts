import { t } from "elysia";
import { PublicUser } from "../user/model";

// Re-export from user module — it's a user domain type
export type { CreateUserData } from "../user/model";

// --- HTTP validation schemas (TypeBox) ---

export const loginBodySchema = t.Object({
  identifier: t.String(),
  password: t.String(),
});

export const registerBodySchema = t.Object({
  username: t.String(),
  first_name: t.String(),
  last_name: t.String(),
  email: t.String(),
  password: t.String({ minLength: 1 }),
  roles: t.Array(t.String()),
});

// --- Domain types (for service layer) ---

export interface LoginCredentials {
  identifier: string // can be email or username
  password: string
}

export interface LoginResponse {
  access_token?: string
  user: PublicUser
}

export interface RegisterResponse {
  user: PublicUser
}

export interface UserPayload {
  payload: PublicUser
}
