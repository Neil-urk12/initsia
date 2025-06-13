import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../controllers/authControllers";
import { CreateUserData, LoginCredentials } from "../types/userTypes";
import { authMiddlewarePlugin } from "../middlewares/authMiddleware"; // Import the middleware plugin

// In-memory token blacklist
// This is a simple in-memory token blacklist to prevent token reuse
// You can use redis or a database if you want to persist the blacklist
const tokenBlacklist: Set<string> = new Set();

const authController = new AuthController();

// Define the main authRoutes instance and apply the JWT plugin globally
// The jwt instance will be available in the context of all subsequent hooks and handlers
const authRoutes = new Elysia({ prefix: "/user" }).use(
  jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET || "default_secret_key", // Ensure this is secure in production
  }),
);

// Define unprotected routes (e.g., login, register)
const unprotectedRoutes = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "default_secret_key", // Ensure this is secure in production
    }),
  )
  // Public: register new user
  .post(
    "/register",
    async ({ body, set }) =>
      authController.register({ body: body as CreateUserData, set }),
  )
  // Public: login
  .post(
    "/login",
    async ({ body, jwt, set }) =>
      authController.login({ body: body as LoginCredentials, jwt, set }),
  );

// Define protected routes within a group that uses the auth middleware
const protectedRoutes = new Elysia()
  .use(authMiddlewarePlugin(tokenBlacklist)) // Apply the auth middleware plugin here
  .post("/logout", async ({ headers, set }) => {
    // logout requires auth middleware to check token validity before blacklisting
    const token = headers.authorization?.split(" ")[1];

    // Although the middleware checks for token presence and validity,
    // this check is still good practice here for clarity before blacklisting.
    // The middleware should prevent reaching this handler if the token is missing or invalid.
    if (!token) {
      // This block should ideally not be reached due to the middleware
      set.status = 400;
      return { success: false, message: "Token not provided." };
    }

    tokenBlacklist.add(token);
    set.status = 200;

    return { success: true, message: "Logged out successfully." };
  });
// Uncomment and move '/register' or '/refresh-token' here if they require authentication
// .post('/register', async ({ body, set }) => authController.register({ body: body as CreateUserData, set }))
// .post('/refresh-token', async ({ headers, set }) => {
//     const token = headers.authorization?.split(' ')[1];
//     if (!token) {
//         set.status = 400;
//         return { success: false, message: 'Token not provided.' };
//     }
//     return authController.refreshToken({ token, set });
// });

// Combine unprotected and protected routes under the main authRoutes prefix
authRoutes.use(unprotectedRoutes).use(protectedRoutes);

export default authRoutes;

// import Elysia from "elysia";
// import { jwt } from "@elysiajs/jwt";
// import { AuthController } from '../controllers/authControllers';
// import { CreateUserData, LoginCredentials } from '../types/userTypes';

// // In-memory token blacklist
// // This is a simple in-memory token blacklist to prevent token reuse
// // You can use redis or a database if you want to persist the blacklist
// const tokenBlacklist: Set<string> = new Set();

// const authRoutes = new Elysia({ prefix: "/user" });
// const authController = new AuthController();

// authRoutes
//     .use( jwt({
//         name: 'jwt',
//         secret: Bun.env.JWT_SECRET || "default_secret_key",
//     }))
//     .onBeforeHandle( async ({ jwt, request, set }) => {
//         const payload = await jwt.verify()
//         if (!payload) {
//             set.status = 401
//             return 'Unauthorized'
//         }

//         const token = request.headers.get('authorization')?.split(' ')[1]
//         if (!token) {
//             set.status = 401
//             return 'Unauthorized'
//         }
//         if (tokenBlacklist.has(token)) {
//             set.status = 401
//             return 'Token is blacklisted'
//         }
//     })
//     .post('/login', async ({ body, jwt, set }) => authController.login({ body: body as LoginCredentials, jwt, set }))
//     // .post('/register', async ({ body, set }) => authController.register({ body: body as CreateUserData, set }))
//     .post('/logout', async ({ headers, set }) => {
//         const token = headers.authorization?.split(' ')[1];

//         if (!token) {
//             set.status = 400;
//             return { success: false, message: 'Token not provided.' };
//         }

//         tokenBlacklist.add(token);
//         set.status = 200;

//         return { success: true, message: 'Logged out successfully.' };
//     })
//     // .post('/refresh-token', async ({ headers, set }) => {
//     //     const token = headers.authorization?.split(' ')[1];
//     //     if (!token) {
//     //         set.status = 400;
//     //         return { success: false, message: 'Token not provided.' };
//     //     }
//     //     return authController.refreshToken({ token, set });
//     // })

// export default authRoutes
