export interface IDatabaseAdapter {
  getConnection(): Promise<any>;
  testConnection(): Promise<void>;
}
