import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, PublicUser, CreateUserData, toPublicUser } from './model';
import { IUserRepository } from './repository';
import {
  EmailExistsError,
  UsernameExistsError,
  UserNotFoundError,
} from './errors';

export interface IUserService {
  register(userData: CreateUserData): Promise<PublicUser>;
  findById(id: string): Promise<PublicUser | null>;
  findForAuthByEmail(email: string): Promise<User | null>;
  findForAuthByUsername(username: string): Promise<User | null>;
}

export class UserService implements IUserService {

  constructor(private userRepo: IUserRepository) {}

  async register(userData: CreateUserData): Promise<PublicUser> {
    const existingEmail = await this.userRepo.findUserByEmail(userData.email);
    if (existingEmail) {
      throw new EmailExistsError();
    }

    const existingUsername = await this.userRepo.findUserByUsername(userData.username);
    if (existingUsername) {
      throw new UsernameExistsError();
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await this.userRepo.createUser({
      user_id: uuidv4(),
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      password_hash: hashedPassword,
      roles: userData.roles,
    });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return toPublicUser(newUser);
  }

  async findById(id: string): Promise<PublicUser | null> {
    const user = await this.userRepo.findUserById(id);
    if (!user) return null;
    return toPublicUser(user);
  }

  async findForAuthByEmail(email: string): Promise<User | null> {
    return this.userRepo.findUserByEmail(email);
  }

  async findForAuthByUsername(username: string): Promise<User | null> {
    return this.userRepo.findUserByUsername(username);
  }
}
