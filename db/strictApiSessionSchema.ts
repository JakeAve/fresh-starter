import { load } from "$std/dotenv/mod.ts";
import { bytesToBase64Url } from "../lib/cryptoHelpers.ts";
import { genRandomBytes } from "../lib/cryptoHelpers.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

const ONE_DAY = 1000 * 60 * 60 * 24;
const MAX_SESSION_USES = 10;
const MAX_SESSION_KEYS_PER_IP = 10;

export interface StrictApiSession {
  key: string;
  uses: number;
  maxUses: number;
  ip: string;
  createdAt: Date;
  expiresAt: Date;
}

export class StrictApiSessionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const STRICT_SESSION_BY_IP_AND_KEY: Deno.KvKey = ["strict_session_key_by_ip"];

export async function addStrictApiSession(
  ip: string,
): Promise<StrictApiSession> {
  const rawKey = genRandomBytes(24);
  const key = bytesToBase64Url(rawKey);

  const session: StrictApiSession = {
    ip,
    uses: 0,
    maxUses: MAX_SESSION_USES,
    key,
    createdAt: new Date(),
    expiresAt: new Date(new Date().getTime() + (1000 * 60 * 5)),
  };

  const byIp = [
    ...STRICT_SESSION_BY_IP_AND_KEY,
    ip,
  ];

  const existingKeys = kv.list<StrictApiSession>({ prefix: byIp });

  let count = 0;
  for await (const existingKey of existingKeys) {
    if (existingKey.value.uses !== 0) {
      count++;
    }
  }

  if (count > MAX_SESSION_KEYS_PER_IP) {
    throw new StrictApiSessionError(
      `IP ${ip} has ${count} keys. Cannot make a new one.`,
    );
  }

  const res = await kv.atomic().set(
    [...byIp, key],
    session,
    { expireIn: ONE_DAY },
  ).commit();

  if (!res.ok) {
    throw new Error("Could not save strict session");
  }

  return session;
}

export async function verifyStrictApiSession(
  key: string,
  ip: string,
): Promise<StrictApiSession> {
  const byKey = [...STRICT_SESSION_BY_IP_AND_KEY, ip, key];

  const res = await kv.get<StrictApiSession>(byKey);
  if (!res.value) {
    throw new StrictApiSessionError(`Cannot find ip ${ip} key ${key}`);
  }

  if (res.value.uses >= res.value.maxUses) {
    throw new StrictApiSessionError(
      `Strict session ${key} reached max uses`,
    );
  }

  if (new Date().getTime() > res.value.expiresAt.getTime()) {
    throw new StrictApiSessionError(`Strict session ${key} is expired`);
  }

  const { ip: savedIp } = res.value;

  if (
    savedIp !== ip
  ) {
    throw new StrictApiSessionError(
      `IP addresses do not match. Saved ${savedIp}. Received ${ip}`,
    );
  }

  return res.value;
}

export async function useStrictApiSession(
  key: string,
  ip: string,
): Promise<StrictApiSession> {
  const res = await verifyStrictApiSession(key, ip);

  const byKey = [...STRICT_SESSION_BY_IP_AND_KEY, ip, key];

  res.uses = res.uses + 1;

  await kv.set(byKey, res, { expireIn: ONE_DAY });

  return res;
}
