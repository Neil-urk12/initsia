import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginCredentials, LoginResponse, CreateUserData, RegisterResponse } from "../types/userTypes";
import { toPublicUser } from "../models/userModels";
import userRepository from "../repository/userRepository";

class AuthService {

    async login(credentials: LoginCredentials): Promise<LoginResponse | null> {
        let user;
        if (credentials.identifier.includes('@'))
            user = await userRepository.findUserByEmail(credentials.identifier);
        else user = await userRepository.findUserByUsername(credentials.identifier);

        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(credentials.password, user?.password_hash || '');

        if (!isPasswordValid) throw new Error("Invalid credentials");

        return {
            user: toPublicUser(user)
        }
    }

    async register(userData: CreateUserData): Promise<RegisterResponse> {
        const existingUser = await userRepository.findUserByEmail(userData.email);

        if (existingUser) {
        throw new Error('Email already registered');
        }

        const existingUsername = await userRepository.findUserByUsername(userData.username);
        if (existingUsername) {
            throw new Error('Username already exists');
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

        const newUser = await userRepository.createUser(userDataWithHash);

        if (!newUser) {
            throw new Error('Failed to create user');
        }

        return {
            user: toPublicUser(newUser)
        }

    }
}

export default new AuthService();
