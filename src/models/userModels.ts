// Sample User interface
// Adjust to your needs and use cases
// I'm using camel cases for backend interface fields to closely align it with database schema
// Adjust it depending on your project requirements and agreed conventions
export interface User {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  roles: string[];
  created_at: Date;
  updated_at?: Date;
}

// Data required to create a new user (timestamps will be provided automatically by the service).
export type NewUser = Omit<User, "created_at" | "updated_at">;

// Partial update – user_id is required to identify the record, all other fields optional.
export type UserUpdate = Partial<Omit<User, "user_id">> & {
  user_id: string;
};
