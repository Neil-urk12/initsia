import { Pool, PoolClient } from "pg";
import { IDatabaseAdapter } from "./IDatabaseAdapter";

export class PostgreSQLAdapter implements IDatabaseAdapter<Pool, PoolClient> {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: Bun.env.DB_HOSTNAME,
      user: Bun.env.DB_USERNAME,
      password: Bun.env.DB_PASSWORD,
      database: Bun.env.DB_DATABASE,
      port: parseInt(Bun.env.DB_PORT || "5432"),
      ssl: Bun.env.DB_SSLMODE !== "disable"
        ? { rejectUnauthorized: true }
        : undefined,
    });
  }

  async getConnection(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async getDbPool(): Promise<Pool> {
    return this.pool;
  }

  async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      console.log("PostgreSQL Database connection successful");
    } catch (error) {
      console.error("PostgreSQL Database connection failed:", error);
      throw error;
    }
  }
}
