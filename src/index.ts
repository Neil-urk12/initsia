import { Elysia } from "elysia";
import { createDatabaseAdapter } from "./config/database/factory";
import type { DatabasePool } from "./config/database/IDatabaseAdapter";
import { createAuthModule } from "./modules/auth";

const PORT = Bun.env.PORT || 3000;
const dbType = (Bun.env.DB_TYPE ?? "mysql").toLowerCase();
const db = createDatabaseAdapter(dbType);

await db.testConnection();

const auth = createAuthModule(db);

const app = new Elysia()
  .get("/", () => "Welcome to Elysia API!")
  .use(auth)
  .get("/ping", async () => {
    return db.execute("SELECT 1");
  })
  .listen(PORT);

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: Closing database connection and exiting.");
  await db.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: Closing database connection and exiting.");
  await db.close();
  process.exit(0);
});

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);