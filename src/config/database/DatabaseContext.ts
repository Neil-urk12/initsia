import { IDatabaseAdapter } from "./IDatabaseAdapter";
import { MySQLAdapter } from "./MySQLAdapter";
import { PostgreSQLAdapter } from "./PostgreSQLAdapter";

export class DatabaseContext {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getDbConnection(): Promise<any> {
    return this.adapter.getConnection();
  }

  async testDbConnection(): Promise<void> {
    await this.adapter.testConnection();
  }
  async getDbPool(): Promise<any> {
    if (this.adapter.getDbPool) {
      return this.adapter.getDbPool();
    }
    return null; // Or throw an error, depending on desired behavior when getDbPool is not implemented
  }

  static create(dbType: string): DatabaseContext {
    let adapter: IDatabaseAdapter;
    switch (dbType.toLowerCase()) {
      case "mysql":
        adapter = new MySQLAdapter();
        break;
      case "postgresql":
        adapter = new PostgreSQLAdapter();
        break;
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
    return new DatabaseContext(adapter);
  }
}
