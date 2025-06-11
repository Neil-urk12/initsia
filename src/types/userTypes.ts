export interface UserDataForCreation {
  full_name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: UserResponse
}

export interface UserResponse {
  user_id: string
  first_name: string
  last_name: string 
  email: string
  roles: string[]
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  password: string
  roles: string[]
}
