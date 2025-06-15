// import { createPool } from "mysql2/promise";

// const pool = createPool({
//   host: Bun.env.DB_HOSTNAME,
//   user: Bun.env.DB_USERNAME,
//   password: Bun.env.DB_PASSWORD,
//   database: Bun.env.DB_DATABASE,
//   port: parseInt(Bun.env.DB_PORT || "3306"),
//   ...(Bun.env.DB_SSLMODE !== "disable" && {
//     ssl: {
//       rejectUnauthorized: true,
//     },
//   }),
// });

// async function testConnection() {
//   try {
//     await pool.getConnection();
//     // Can execute test queries or create table if not exists here too
//     console.log("Database connection successful");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//   }
// }

// await testConnection();

// export default pool;

import { DatabaseContext } from "./database/DatabaseContext";

const rawDbType = typeof Bun !== 'undefined' && Bun.env && typeof Bun.env.DB_TYPE === 'string'
  ? Bun.env.DB_TYPE
  : "mysql"; // Fallback to "mysql" if Bun.env or DB_TYPE is not a string

const dbType = rawDbType.toLowerCase(); // Ensure it's lowercase for the switch statement
const dbContext = DatabaseContext.create(dbType);

async function testDatabaseConnection() {
  try {
    await dbContext.testDbConnection();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit if database connection fails
  }
}

await testDatabaseConnection();

export default dbContext;
export const pool = await dbContext.getDbPool()
