import { Elysia } from "elysia";
import pool from "./config/db_config";
import authRoutes from "./routes/authRoutes";

const PORT = Bun.env.PORT || 3000;
// const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

const app = new Elysia()
  .get('/', () => "Welcome to Elysia API!")
  .use(authRoutes)
  .get('/ping', async () => {
    // quick health-check query
    const [rows] = await pool.execute('SELECT * FROM users');
    return rows;
  })
  .listen(PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
