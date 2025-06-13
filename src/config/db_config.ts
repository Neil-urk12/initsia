import { createPool } from "mysql2/promise";

const pool = createPool({
  host: Bun.env.DB_HOSTNAME,
  user: Bun.env.DB_USERNAME,
  password: Bun.env.DB_PASSWORD,
  database: Bun.env.DB_DATABASE,
  port: parseInt(Bun.env.DB_PORT || "3306"),
  ...(Bun.env.DB_SSLMODE !== "disable" && {
    ssl: {
      rejectUnauthorized: true,
    },
  }),
});

async function testConnection() {
  try {
    await pool.getConnection();
    // Can execute test queries or create table if not exists here too
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

await testConnection();

export default pool;
