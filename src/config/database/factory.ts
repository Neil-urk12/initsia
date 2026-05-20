import { IDatabaseAdapter } from "./IDatabaseAdapter";
import { MySQLAdapter } from "./MySQLAdapter";
import { PostgreSQLAdapter } from "./PostgreSQLAdapter";

export function createDatabaseAdapter(dbType: string): IDatabaseAdapter<any, any> {
  switch (dbType) {
    case "mysql":
      return new MySQLAdapter();
    case "postgresql":
      return new PostgreSQLAdapter();
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}
