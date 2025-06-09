import { createPool } from "mysql2/promise";

const pool = createPool({
  host: Bun.env.DB_HOST,
  user: Bun.env.DB_USER,
  password: Bun.env.DB_PASSWORD,
  database: Bun.env.DB_NAME,
  port: parseInt(Bun.env.DB_PORT || "3306"),
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
