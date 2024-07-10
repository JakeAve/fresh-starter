import { monotonicUlid } from "$std/ulid/mod.ts";
import { load } from "$std/dotenv/mod.ts";
import { hashPassword, verifyPassword } from "../lib/cryptoHelpers.ts";
import { AuthenticationError } from "../Errors/AuthenticationError.ts";

const USERS_BY_ID: Deno.KvKey = ["users"];
const USERS_BY_EMAIL: Deno.KvKey = ["user_emails"];
const USERS_BY_HANDLE: Deno.KvKey = ["user_handles"];

export interface User {
  email: string;
  name: string;
  handle: string;
  password: string;
  id: string;
}

export interface UserBody {
  email: string;
  name: string;
  handle: string;
  password: string;
}

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

  const user: User = { ...userBody, id };
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
  console.log("saved res", res);
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

export async function authenticate(email: string, password: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AuthenticationError(email);
    }
    const isVerified = await verifyPassword(password, user.password);

    if (isVerified) {
      return user;
    }
    throw new Error("Unknown error");
  } catch (err) {
    console.log(err);
    throw new AuthenticationError(email);
  }
}
