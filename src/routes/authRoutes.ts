import Elysia from "elysia";
import authService from "../services/authService";
import { CreateUserData, LoginCredentials } from '../types/userTypes';

export const authRoutes = new Elysia({ prefix: "/auth" });

authRoutes
    .post('/login', async ({ body, set }) => {
        try {
            console.log('Login request received with body: ', body);
            return await authService.login(body as LoginCredentials);
        } catch ( error ) {
            console.error('Login error: ', error)
            set.status = 400
            return {
                success: false,
                message: 'Login failed. Please check your credentials.'
            }
        }
    } )
    .post('/register', async ({ body, set }) => {
        try {
            console.log('Register attempt with body: ', body)
            return await authService.register(body as CreateUserData)
        } catch ( error ) {
            console.error('Registration error: ', error)
            set.status = 400
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            }
        }
    })
