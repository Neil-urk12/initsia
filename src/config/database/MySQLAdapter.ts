import { createPool, Pool, PoolConnection } from "mysql2/promise";
import { IDatabaseAdapter } from "./IDatabaseAdapter";

export class MySQLAdapter implements IDatabaseAdapter {
  private pool: Pool;

  constructor() {
    this.pool = createPool({
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
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async testConnection(): Promise<void> {
    try {
      await this.pool.getConnection();
      console.log("MySQL Database connection successful");
    } catch (error) {
      console.error("MySQL Database connection failed:", error);
      throw error;
    }
  }
}
