import { createDatabaseAdapter } from "./database/factory";

const dbType = (Bun.env.DB_TYPE ?? "mysql").toLowerCase();
const adapter = createDatabaseAdapter(dbType);

export async function getDbPool() {
  return adapter.getDbPool();
}

export async function testDbConnection() {
  return adapter.testConnection();
}