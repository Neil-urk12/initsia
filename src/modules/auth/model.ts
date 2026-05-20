import { PublicUser } from "../user/model";

// Re-export from user module — it's a user domain type
export type { CreateUserData } from "../user/model";

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
