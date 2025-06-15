import dbContext from "../config/db_config";
import { User, NewUser, UserUpdate } from "../models/userModels";

class UserRepository {
  constructor() {}

  async findUserById(id: string): Promise<User | null> {
    return await this.findUserByIdNative(id);
  }

  async findUsers(criteria: Partial<User>) {
    return await this.findUsersNative(criteria);
  }

  async createUser(user: NewUser): Promise<User | null> {
    return await this.createUserNative(user);
  }

  async updateUser(user: UserUpdate): Promise<User | null> {
    return await this.updateUserNative(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.findUserByEmailNative(email);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.findUserByUsernameNative(username);
  }

  // native SQL query methods
  async findUserByIdNative(id: string): Promise<User | null> {
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [id]
    ));
    return (rows as User[])[0] || null;
  }

  async findUserByEmailNative(email: string): Promise<User | null> {
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    ));
    return (rows as User[])[0] || null;
  }

  async findUserByUsernameNative(username: string): Promise<User | null> {
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    ));
    return (rows as User[])[0] || null;
  }

  async createUserNative(user: NewUser): Promise<User | null> {
    const rolesJson = JSON.stringify(user.roles);
    const values = [
      user.user_id,
      user.username,
      user.first_name,
      user.last_name,
      user.email,
      user.password_hash,
      rolesJson
    ];
    await dbContext.getDbConnection().then(conn => conn.execute(
      "INSERT INTO users (user_id, username, first_name, last_name, email, password_hash, roles) VALUES (?, ?, ?, ?, ?, ?, ?)",
      values
    ));
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [user.user_id]
    ));
    return (rows as User[])[0] || null;
  }

  async updateUserNative(user: UserUpdate): Promise<User | null> {
    const updates: string[] = [];
    const params: any[] = [];
    if (user.username !== undefined) { updates.push("username = ?"); params.push(user.username); }
    if (user.first_name !== undefined) { updates.push("first_name = ?"); params.push(user.first_name); }
    if (user.last_name !== undefined) { updates.push("last_name = ?"); params.push(user.last_name); }
    if (user.email !== undefined) { updates.push("email = ?"); params.push(user.email); }
    if (user.password_hash !== undefined) { updates.push("password_hash = ?"); params.push(user.password_hash); }
    if (user.roles !== undefined) { updates.push("roles = ?"); params.push(JSON.stringify(user.roles)); }
    if (user.updated_at !== undefined) { updates.push("updated_at = ?"); params.push(user.updated_at); }
    params.push(user.user_id!);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
    await dbContext.getDbConnection().then(conn => conn.execute(sql, params));
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [user.user_id]
    ));
    return (rows as User[])[0] || null;
  }

  async findUsersNative(criteria: Partial<User>): Promise<User[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    if (criteria.first_name !== undefined) { conditions.push("first_name = ?"); params.push(criteria.first_name); }
    if (criteria.last_name !== undefined) { conditions.push("last_name = ?"); params.push(criteria.last_name); }
    if (criteria.created_at !== undefined) { conditions.push("created_at = ?"); params.push(criteria.created_at); }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows]: any = await dbContext.getDbConnection().then(conn => conn.execute(
      `SELECT * FROM users ${whereClause}`,
      params
    ));
    return rows as User[];
  }
}

export default new UserRepository()
