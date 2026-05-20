export interface IDatabaseAdapter<TPool, TConnection> {
  getConnection(): Promise<TConnection>;
  testConnection(): Promise<void>;
  getDbPool(): Promise<TPool>;
}
