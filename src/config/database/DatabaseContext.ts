import { IDatabaseAdapter } from "./IDatabaseAdapter";
import { MySQLAdapter } from "./MySQLAdapter";
import { PostgreSQLAdapter } from "./PostgreSQLAdapter";
import { Pool, PoolConnection } from "mysql2/promise";

export class DatabaseContext<TPool, TConnection> {
  private adapter: IDatabaseAdapter<TPool, TConnection>;

  constructor(adapter: IDatabaseAdapter<TPool, TConnection>) {
    this.adapter = adapter;
  }

  async getDbConnection(): Promise<TConnection> {
    return this.adapter.getConnection();
  }

  async testDbConnection(): Promise<void> {
    await this.adapter.testConnection();
  }

  async getDbPool(): Promise<TPool> {
    return this.adapter.getDbPool();
  }

  static create(dbType: string): DatabaseContext<any, any> {
    switch (dbType.toLowerCase()) {
      case "mysql":
        return new DatabaseContext<Pool, PoolConnection>(new MySQLAdapter());
      case "postgresql":
        return new DatabaseContext(new PostgreSQLAdapter());
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}
