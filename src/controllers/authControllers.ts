import authService from "../services/authService";
import jwt from "@elysiajs/jwt";
import { CreateUserData, LoginCredentials, LoginResponse, UserResponse } from '../types/userTypes';

export class AuthController {
    async login({ body, jwt, set }: { body: LoginCredentials, jwt: any, set: { status?: number | string } }): Promise<LoginResponse | null> {
        try {
            console.log('Login request received with body: ', body);
            const userPayload = await authService.login(body);
            if (!userPayload) {
                set.status = 401;
                throw new Error('Invalid credentials');
            }

            const token = await jwt.sign(userPayload)
            return {
                user: userPayload.user as UserResponse,
                access_token: token
            };
        } catch (error) {
            console.error('Login error: ', error);
            set.status = 400;
            throw new Error('Login failed. Please check your credentials and try again.');
        }
    }

    async register({ body, set }: { body: CreateUserData, set: { status?: number | string } }) {
        try {
            console.log('Register attempt with body: ', body);
            const result = await authService.register(body);
            return {
                success: true,
                ...result
            }
        } catch (error) {
            console.error('Registration error: ', error);
            set.status = 400;
            throw new Error('Registration failed. Please try again.');
        }
    }
}
