import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  users: UserTable;
}

// Sample User interface
// Adjust to your needs and use cases
// I'm using camel cases for backend interface fields to closely align it with database schema
// Adjust it depending on your project requirements and agreed conventions
export interface UserTable {
  user_id: Generated<string>;
  // full_name: string
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  roles: string[];
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
  // metadata: JSONColumnType<{
  //   login_at: string
  //   last_login_at: string
  //   last_logout_at: string     //optional
  //   ip: string | null
  //   // plan:
  // }>
}

export type User = Selectable<UserTable>;

export interface UserDataForCreation {
  full_name: string;
  email: string;
  password: string;
  roles: string[];
}
