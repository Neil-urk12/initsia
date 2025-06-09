import { createPool } from "mysql2/promise";
import { User } from "../types/userTypes";
import { Database } from "../types/userTypes";
import { Kysely, MysqlDialect } from "kysely";

// In case you prefer not to use Kysely
// const pool = createPool({
//   host: Bun.env.DB_HOST,
//   user: Bun.env.DB_USER,
//   password: Bun.env.DB_PASSWORD,
//   database: Bun.env.DB_NAME,
//   port: parseInt(Bun.env.DB_PORT || "3306"),
//   ...(process.env.DB_SSLMODE !== "disable" && {
//     ssl: {
//       rejectUnauthorized: true,
//     },
//   }),
// });
//
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
//
// export default pool;

const dialect = new MysqlDialect({
  pool: createPool({
    host: Bun.env.DB_HOST,
    user: Bun.env.DB_USER,
    password: Bun.env.DB_PASSWORD,
    database: Bun.env.DB_NAME,
    port: parseInt(Bun.env.DB_PORT || "3306"),
    ...(process.env.DB_SSLMODE !== "disable" && {
      ssl: {
        rejectUnauthorized: true,
      },
    }),
  }),
});

export const db = new Kysely<User>({
  dialect,
});
