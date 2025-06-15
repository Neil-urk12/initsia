import { IDatabaseAdapter } from "./IDatabaseAdapter";

export class PostgreSQLAdapter implements IDatabaseAdapter {
  constructor() {
    console.warn("PostgreSQLAdapter is a placeholder and not yet implemented.");
  }

  async getConnection(): Promise<any> {
    throw new Error("PostgreSQLAdapter: getConnection not implemented.");
  }

  async testConnection(): Promise<void> {
    console.warn("PostgreSQLAdapter: testConnection not implemented.");
    throw new Error("PostgreSQLAdapter: testConnection not implemented.");
  }
}
