import { createPool, Pool } from "mysql2/promise";
import { DatabasePool } from "./IDatabaseAdapter";

export class MySQLAdapter implements DatabasePool {
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

  async execute<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params ?? []);
    return rows as T[];
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

  async close(): Promise<void> {
    await this.pool.end();
  }
}
