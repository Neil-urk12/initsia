import { db } from "../config/db_config";
import { User, NewUser, UserUpdate } from "../models/userModels";

class UserRepository {
  constructor() {}

  async findUserById(id: string): Promise<User | null> {
    return await db
      .selectFrom("users")
      .where("user_id", "=", id)
      .selectAll()
      .executeTakeFirst() || null
  }

  async findUsers(criteria: Partial<User>) {
    let query = db.selectFrom("users");

    if (criteria.first_name) {
      query = query.where("first_name", "=", criteria.first_name);
    }

    if (criteria.last_name !== undefined) {
      query = query.where(
        "last_name",
        criteria.last_name === null ? "is" : "=",
        criteria.last_name,
      );
    }

    if (criteria.created_at) {
      query = query.where("created_at", "=", criteria.created_at);
    }

    return await query.selectAll().execute();
  }

  async createUser(user: NewUser): Promise<User | null> {
    return await db
      .insertInto("users")
      .values(user)
      .returningAll()
      .executeTakeFirst() || null
  }

  async updateUser(user: UserUpdate): Promise<User | null> {
    return await db
      .updateTable("users")
      .set(user)
      .where("user_id", "=", user.user_id!)
      .returningAll()
      .executeTakeFirst() || null;
  }

  async findUserByEmail(email: string) {
    return await db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirstOrThrow();
  }

}

export default new UserRepository()
