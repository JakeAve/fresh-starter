import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
import { monotonicUlid } from "$std/ulid/mod.ts";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

type ChallengeOptions =
  | PublicKeyCredentialCreationOptionsJSON
  | PublicKeyCredentialRequestOptionsJSON;

export type Challenge = ChallengeOptions & {
  id: string;
};

const CHALLENGE_BY_ID: Deno.KvKey = ["passkey_create_options"];
const CHALLENGE_BY_USER_ID: Deno.KvKey = ["user_passkey_create_options"];

export async function addChallenge(
  creationOptions:
    | PublicKeyCredentialCreationOptionsJSON
    | PublicKeyCredentialRequestOptionsJSON,
  userId: string,
) {
  const id = monotonicUlid();

  const challenge: Challenge = { ...creationOptions, id };

  const byId = [...CHALLENGE_BY_ID, challenge.id];
  const byUserId = [...CHALLENGE_BY_USER_ID, userId];

  const res = await kv.atomic()
    .check({ key: byId, versionstamp: null })
    .set(byId, challenge, { expireIn: 3600000 })
    .set(byUserId, challenge, { expireIn: 3600000 })
    .commit();

  if (!res.ok) {
    console.error("Cannot save", res);
    throw new Error(`Could not save challenge`);
  }

  return res;
}

export async function getChallengesByUserId(userId: string) {
  const res = await kv.get<Challenge>([...CHALLENGE_BY_USER_ID, userId]);
  return res.value;
}
