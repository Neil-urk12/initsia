import { User, NewUser, UserUpdate } from "../models/userModels";

export interface IUserRepository {
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUser(user: NewUser): Promise<User | null>;
  updateUser(user: UserUpdate): Promise<User | null>;
  findUsers(criteria: Partial<User>): Promise<User[]>;
}
