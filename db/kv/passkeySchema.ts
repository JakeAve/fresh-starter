import {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
} from "@simplewebauthn/types";
import { load } from "$std/dotenv/mod.ts";
import { DataError } from "../../Errors/DataError.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

export interface Passkey {
  id: Base64URLString;
  publicKey: Uint8Array;
  userId: string;
  webAuthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
  nickname: string;
}

const PASSKEYS_BY_ID: Deno.KvKey = ["passkeys"];
const PASSKEYS_BY_USER_ID: Deno.KvKey = ["user_passkeys"];

export async function addPasskey(passkeyBody: Passkey) {
  const passkey: Passkey = passkeyBody;

  const byId = [...PASSKEYS_BY_ID, passkey.id];
  const byUserId = [...PASSKEYS_BY_USER_ID, passkey.userId, passkey.id];

  const res = await kv.atomic().check({ key: byId, versionstamp: null })
    .check({ key: byUserId, versionstamp: null }).set(byId, passkey).set(
      byUserId,
      passkey,
    ).commit();

  if (!res.ok) {
    console.error("Cannot save");
    throw new Error(`Could not save passkey`);
  }

  return res;
}

export async function getPasskeyById(passkeyId: string) {
  const res = await kv.get<Passkey>([
    ...PASSKEYS_BY_ID,
    passkeyId,
  ]);
  return res.value;
}

export async function getPasskeysByUserId(userId: string) {
  try {
    const iter = kv.list<Passkey>({
      prefix: [...PASSKEYS_BY_USER_ID, userId],
    });
    const keys = [];
    for await (const res of iter) keys.push(res.value);
    return keys;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getPasskeyByUserIdAndKeyId(
  userId: string,
  passkeyId: string,
) {
  const res = await kv.get<Passkey>([
    ...PASSKEYS_BY_USER_ID,
    userId,
    passkeyId,
  ]);
  return res.value;
}

export async function deletePassKeyByUserIdAndKeyId(
  userId: string,
  passkeyId: string,
) {
  const byId = [...PASSKEYS_BY_ID, passkeyId];
  const byUserId = [...PASSKEYS_BY_USER_ID, userId, passkeyId];

  const result = await kv.atomic()
    .delete(byId)
    .delete(byUserId)
    .commit();
  if (!result.ok) {
    throw new DataError(`Error deleting key ${passkeyId}`);
  }
}

export async function addCount(userId: string, passkeyId: string) {
  const byId = [...PASSKEYS_BY_ID, passkeyId];
  const byUserId = [...PASSKEYS_BY_USER_ID, userId, passkeyId];

  const [entry1, entry2] = await kv.getMany<Passkey[]>([byId, byUserId]);

  if (!entry1.value || !entry2.value) {
    throw new Error("One or both entries do not exist.");
  }

  const counter1 = entry1.value.counter;
  const counter2 = entry2.value.counter;

  const newCounter = Math.max(counter1, counter2) + 1;

  const atomic = kv.atomic()
    .check(entry1)
    .check(entry2)
    .set(byId, { ...entry1.value, counter: newCounter })
    .set(byUserId, { ...entry2.value, counter: newCounter });

  const success = await atomic.commit();

  if (!success) {
    throw new Error("Atomic commit failed.");
  }
}
