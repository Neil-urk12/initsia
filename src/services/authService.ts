import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { LoginCredentials, LoginResponse, CreateUserData } from "../types/userTypes";
import userRepository from "../repository/userRepository";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h";

// In-memory token blacklist
// This is a simple in-memory token blacklist to prevent token reuse
// You can use redis or a database if you want to persist the blacklist
const tokenBlacklist: Set<string> = new Set();

class AuthService {
    generateToken(userId: string): string {
        const payload = { userId };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as SignOptions);
    }

    blacklistToken(token: string): void {
        tokenBlacklist.add(token);
    }

    verifyToken(token: string): { userId: string } | null {
        if (tokenBlacklist.has(token)) return null;
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
            return { userId: decoded.userId };
        } catch (error) {
            return null;
        }
    }

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const user = await userRepository.findUserByEmail(credentials.email);
        
        // Basic authentication - in real apps, use hashed passwords!
        if (!user || user.password_hash !== credentials.password) {
            throw new Error("Invalid credentials");
        }
        
        return {
            access_token: this.generateToken(user.user_id),
            user: user
        };
    }

    async register(userData: CreateUserData): Promise<LoginResponse> {
        const existingUser = await userRepository.findUserByEmail(userData.email);
    
        if (existingUser) {
        throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userDataWithHash = {
            user_id: uuidv4(),
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            password_hash: hashedPassword,
            roles: userData.roles,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const newUser = await userRepository.createUser(userDataWithHash);

        if (!newUser) {
            throw new Error('Failed to create user');
        }

        const token = this.generateToken(newUser.user_id);

        const userResponse = {
            user_id: newUser.user_id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            roles: newUser.roles,
        };

        return {
            access_token: token,
            user: userResponse
        };
    }

    // async logout(user: )
}

export default new AuthService();
