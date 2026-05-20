import { Pool } from "pg";
import { DatabasePool } from "./IDatabaseAdapter";

export class PostgreSQLAdapter implements DatabasePool {
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

  async execute<T>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params ?? []);
    return result.rows as T[];
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

  async close(): Promise<void> {
    await this.pool.end();
  }
}
