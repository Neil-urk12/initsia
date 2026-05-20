import { Pool } from "mysql2/promise";
import { DatabaseContext } from "./database/DatabaseContext";

const rawDbType = typeof Bun !== "undefined" && Bun.env && typeof Bun.env.DB_TYPE === "string"
  ? Bun.env.DB_TYPE
  : "mysql";

const dbType = rawDbType.toLowerCase();
const dbContext = DatabaseContext.create(dbType);

async function testDatabaseConnection(): Promise<void> {
  try {
    await dbContext.testDbConnection();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

await testDatabaseConnection();

export { dbContext };
export const pool: Pool = await dbContext.getDbPool();
