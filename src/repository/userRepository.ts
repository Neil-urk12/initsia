import { db } from "../config/db_config";
import { User, NewUser, UserUpdate } from "../models/userModels";

export async function findUserById(id: string) {
  return await db
    .selectFrom("users")
    .where("user_id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function findUsers(criteria: Partial<User>) {
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

export async function createUser(user: NewUser) {
  const { insertId } = await db
    .insertInto("users")
    .values(user)
    .executeTakeFirstOrThrow();

  return await findUserById(insertId!.toString());
}

export async function updateUser(user: UserUpdate) {
  await db
    .updateTable("users")
    .set(user)
    .where("user_id", "=", user.user_id!)
    .executeTakeFirstOrThrow();
}
