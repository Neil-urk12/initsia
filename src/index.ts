import { Elysia } from "elysia";
import { testDbConnection, getDbPool } from "./config/db_config";
import { auth } from "./modules/auth";

const PORT = Bun.env.PORT || 3000;

await testDbConnection();

const app = new Elysia()
  .get("/", () => "Welcome to Elysia API!")
  .use(auth)
  .get("/ping", async () => {
    const pool = await getDbPool();
    return await pool.execute("SELECT 1");
  })
  .listen(PORT);

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: Closing database connection and exiting.");
  const pool = await getDbPool();
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: Closing database connection and exiting.");
  const pool = await getDbPool();
  await pool.end();
  process.exit(0);
});

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
