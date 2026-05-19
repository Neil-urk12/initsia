import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginCredentials, LoginResponse, CreateUserData, UserResponse, RegisterResponse } from "../types/userTypes";
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
            user: {
                user_id: user.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                roles: user.roles
            } as UserResponse
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

        const userResponse = {
            user_id: newUser.user_id,
            username: newUser.username,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            roles: newUser.roles,
        };

        return {
            user: userResponse
        }

    }
}

export default new AuthService();
