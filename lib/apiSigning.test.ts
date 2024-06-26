import { assert, assertEquals, assertNotEquals } from "$std/assert/mod.ts";
import {
  genRandomBytes,
  genSignature,
  genSigningKeys,
  verifySignature
} from "./apiSigning.ts";

Deno.test("genRandomBytes() creates a random hex with default 256 bits", () => {
  const val = genRandomBytes();
  assertEquals(val.length, 32);
  assertNotEquals(val, genRandomBytes(32));
});

Deno.test("genSigningKeys() works", async () => {
  const keys = await genSigningKeys();
  const val = crypto.getRandomValues(new Uint8Array(32));
  const signature = await crypto.subtle.sign("Ed25519", keys.privateKey, val);
  const verified = await crypto.subtle.verify(
    "Ed25519",
    keys.publicKey,
    signature,
    val,
  );

  assert(verified);
});

Deno.test("genSignature() and verifySignature()", async () => {
  const keys = await genSigningKeys();
  const hex = await genSignature(keys.privateKey);
  const isVerified = await verifySignature(hex, keys.publicKey);

  assert(isVerified);
});
