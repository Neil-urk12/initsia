import { PublicUser } from "../user/model";

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

export interface CreateUserData {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  roles: string[]
}
