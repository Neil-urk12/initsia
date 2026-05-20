import * as bcrypt from 'bcrypt';
import { LoginCredentials, LoginResponse, RegisterResponse } from "./model";
import { CreateUserData, toPublicUser } from "../user/model";
import { IUserService } from "../user/service";
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from "../user/errors";
import { ITokenBlacklist } from "./blacklist";

export class AuthService {

    constructor(
      private userService: IUserService,
      private tokenBlacklist: ITokenBlacklist,
    ) {}

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        let user;
        if (credentials.identifier.includes('@'))
            user = await this.userService.findForAuthByEmail(credentials.identifier);
        else user = await this.userService.findForAuthByUsername(credentials.identifier);

        if (!user) throw new UserNotFoundError();

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isPasswordValid) throw new InvalidCredentialsError();

        return {
            user: toPublicUser(user)
        }
    }

    async register(userData: CreateUserData): Promise<RegisterResponse> {
        const publicUser = await this.userService.register(userData);
        return { user: publicUser };
    }

    logout(token: string): void {
        this.tokenBlacklist.add(token);
    }

    isTokenBlacklisted(token: string): boolean {
        return this.tokenBlacklist.has(token);
    }
}
