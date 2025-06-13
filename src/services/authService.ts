import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginCredentials, LoginResponse, CreateUserData, UserResponse, RegisterResponse } from "../types/userTypes";
import userRepository from "../repository/userRepository";
import pool from "../config/db_config";

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

    // native SQL service methods
    async loginNative(credentials: LoginCredentials): Promise<LoginResponse | null> {
        let user;
        if (credentials.identifier.includes('@')) {
          const [rows]: any = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [credentials.identifier]
          );
          user = (rows as any[])[0];
        } else {
          const [rows]: any = await pool.execute(
            "SELECT * FROM users WHERE username = ?",
            [credentials.identifier]
          );
          user = (rows as any[])[0];
        }
        if (!user) throw new Error("User not found");
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash || ''
        );
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
        };
    }

    async registerNative(userData: CreateUserData): Promise<RegisterResponse> {
        const [existingRows]: any = await pool.execute(
          "SELECT * FROM users WHERE email = ?",
          [userData.email]
        );
        if ((existingRows as any[]).length) {
          throw new Error("Email already registered");
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const id = uuidv4();
        await pool.execute(
          "INSERT INTO users (user_id, username, first_name, last_name, email, password_hash, roles) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            id,
            userData.username,
            userData.first_name,
            userData.last_name,
            userData.email,
            hashedPassword,
            JSON.stringify(userData.roles)
          ]
        );
        const [rows]: any = await pool.execute(
          "SELECT * FROM users WHERE user_id = ?",
          [id]
        );
        const newUser = (rows as any[])[0];
        if (!newUser) throw new Error("Failed to create user");
        return {
          user: {
            user_id: newUser.user_id,
            username: newUser.username,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            roles: newUser.roles
          } as UserResponse
        };
    }
}

export default new AuthService();
