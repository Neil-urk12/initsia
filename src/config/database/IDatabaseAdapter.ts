export interface DatabasePool {
  execute<T>(sql: string, params?: any[]): Promise<T[]>;
  testConnection(): Promise<void>;
  close(): Promise<void>;
}