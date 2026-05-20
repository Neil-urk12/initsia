import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginCredentials, LoginResponse, CreateUserData, RegisterResponse } from "./model";
import { toPublicUser } from "../user/model";
import { IUserRepository } from "../user/repository";
import {
  InvalidCredentialsError,
  UserNotFoundError,
  EmailExistsError,
  UsernameExistsError,
} from "./errors";

export interface ITokenBlacklist {
  add(token: string): void;
  has(token: string): boolean;
}

export class InMemoryTokenBlacklist implements ITokenBlacklist {
  private tokens: Set<string> = new Set();
  add(token: string): void { this.tokens.add(token); }
  has(token: string): boolean { return this.tokens.has(token); }
}

export class AuthService {

    constructor(
      private userRepo: IUserRepository,
      private tokenBlacklist?: ITokenBlacklist,
    ) {}

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        let user;
        if (credentials.identifier.includes('@'))
            user = await this.userRepo.findUserByEmail(credentials.identifier);
        else user = await this.userRepo.findUserByUsername(credentials.identifier);

        if (!user) throw new UserNotFoundError();

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) throw new InvalidCredentialsError();

        return {
            user: toPublicUser(user)
        }
    }

    async register(userData: CreateUserData): Promise<RegisterResponse> {
        const existingUser = await this.userRepo.findUserByEmail(userData.email);

        if (existingUser) {
            throw new EmailExistsError();
        }

        const existingUsername = await this.userRepo.findUserByUsername(userData.username);
        if (existingUsername) {
            throw new UsernameExistsError();
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userDataWithHash = {
            user_id: uuidv4(),
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            password_hash: hashedPassword,
            roles: userData.roles
        };

        const newUser = await this.userRepo.createUser(userDataWithHash);

        if (!newUser) {
            throw new Error('Failed to create user');
        }

        return {
            user: toPublicUser(newUser)
        }
    }

    logout(token: string): void {
        if (!this.tokenBlacklist) {
            throw new Error('Token blacklist not configured');
        }
        this.tokenBlacklist.add(token);
    }

    isTokenBlacklisted(token: string): boolean {
        if (!this.tokenBlacklist) return false;
        return this.tokenBlacklist.has(token);
    }
}
