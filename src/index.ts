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
    return await pool.execute('SELECT 1');
  })
  .listen(PORT)
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: Closing database connection and exiting.');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: Closing database connection and exiting.');
  await pool.end();
  process.exit(0);
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
