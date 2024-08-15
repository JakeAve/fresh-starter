import { monotonicUlid } from "$std/ulid/mod.ts";
import { load } from "$std/dotenv/mod.ts";
import { hashPassword } from "../lib/cryptoHelpers.ts";

const USERS_BY_ID: Deno.KvKey = ["users"];
const USERS_BY_EMAIL: Deno.KvKey = ["user_emails"];
const USERS_BY_HANDLE: Deno.KvKey = ["user_handles"];
export interface User {
  email: string;
  name: string;
  handle: string;
  password: string;
  id: string;
  refreshTokenVersion: number;
  isEmailVerified: boolean;
}

export type SanitizedUser = Omit<User, "password" | "id">;

export type UserBody = Omit<User, "id" | "refreshTokenVersion" | "isEmailVerified">;

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

export async function addUser(userBody: UserBody) {
  const id = monotonicUlid();

  userBody.email = userBody.email.toLocaleLowerCase();
  userBody.handle = userBody.handle.toLocaleLowerCase();
  userBody.password = await hashPassword(userBody.password);

  const user: User = { ...userBody, id, refreshTokenVersion: 1, isEmailVerified: false };
  const primaryKey = [...USERS_BY_ID, user.id];
  const byEmailKey = [...USERS_BY_EMAIL, user.email];
  const byHandleKey = [...USERS_BY_HANDLE, user.handle];
  const res = await kv.atomic().check({ key: primaryKey, versionstamp: null })
    .check({ key: byEmailKey, versionstamp: null }).check({
      key: byHandleKey,
      versionstamp: null,
    }).set(primaryKey, user).set(byEmailKey, user).set(byHandleKey, user)
    .commit();
  if (!res.ok) {
    console.error("Cannot save");
    throw new DuplicateError(`User already exists`);
  }
  return res;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>([...USERS_BY_ID, id]);
  return res.value;
}

export async function getAllUsers() {
  const iter = kv.list<string>({ prefix: USERS_BY_ID });
  const users = [];
  for await (const res of iter) users.push(res.value);
  return users;
}

export async function getUserByEmail(email: string) {
  email = email.toLocaleLowerCase();
  const res = await kv.get<User>([...USERS_BY_EMAIL, email]);
  return res.value;
}

export async function getUserByHandle(handle: string) {
  handle = handle.toLocaleLowerCase();
  const res = await kv.get<User>([...USERS_BY_HANDLE, handle]);
  return res.value;
}

export async function incrementRefreshTokenVersion(email: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error(`Cannot get user: ${email}`);
  }

  const newVersion = user.refreshTokenVersion
    ? user.refreshTokenVersion + 1
    : 1;

  return updateUserByEmail(email, { refreshTokenVersion: newVersion });
}

export async function updateUserByEmail(
  email: string,
  updatedUser: Partial<User>,
) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error(`Cannot get user: ${email}`);
  }

  const keys = [
    "email",
    "name",
    "handle",
    "password",
    "refreshTokenVersion",
    "isEmailVerified"
  ] as Array<keyof User>;

  const oldUser = {...user}

  for (const key in updatedUser) {
    const k = key as keyof Partial<User>;
    if (keys.includes(k)) {
      // @ts-ignore I'm sure there's a way to fix this
      user[k] = updatedUser[k];
    }
  }

  const primaryKey = [...USERS_BY_ID, user.id];
  const byEmailKey = [...USERS_BY_EMAIL, user.email];
  const byHandleKey = [...USERS_BY_HANDLE, user.handle];

  const res = await kv.atomic().set(primaryKey, user).set(byEmailKey, user).set(
    byHandleKey,
    user,
  ).commit();

  if (!res.ok) {
    console.error(`Cannot update ${email}`);
  }

  let deleteTransaction = kv.atomic();
  if (oldUser.email !== user.email) {
    deleteTransaction = deleteTransaction.delete([...USERS_BY_EMAIL, oldUser.email])
  }
  if (oldUser.handle !== user.handle) {
    deleteTransaction = deleteTransaction.delete([...USERS_BY_HANDLE, oldUser.handle])
  }

  await deleteTransaction.commit();

  return res;
}
