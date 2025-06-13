
export interface BaseUser {
  user_id: string
  username: string
  first_name: string
  last_name: string 
  email: string
  roles: string[]
}

export interface LoginCredentials {
  identifier: string // can be email or username
  password: string
}

export interface LoginResponse {
  access_token?: string
  user: BaseUser
}

export interface RegisterResponse {
  user: BaseUser
}

export interface UserPayload {
  payload: BaseUser
}

export interface UserResponse {
  user_id: string
  username: string
  first_name: string
  last_name: string 
  email: string
  roles: string[]
}

export interface CreateUserData {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  roles: string[]
}
