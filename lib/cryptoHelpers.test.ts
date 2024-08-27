import {
  assert,
  assertEquals,
  assertGreater,
  assertNotEquals,
} from "$std/assert/mod.ts";
import {
  decrypt,
  decryptSeconds,
  encrypt,
  encryptSeconds,
  genAESGCMKey,
  genDigitOTP,
  generatePBKDF2Hash,
  genHMACKey,
  genRandomBytes,
  signWithHMAC,
  verifyWithHMAC,
} from "./cryptoHelpers.ts";

Deno.test("genRandomBytes() creates a random hex with default 256 bits", () => {
  const val = genRandomBytes();
  assertEquals(val.length, 32);
  assertNotEquals(val, genRandomBytes(32));
});

Deno.test("genAESGCMKey() key can encrypt and decrypt", async () => {
  const message = "Alice is paranoid";
  const key = await genAESGCMKey();
  const iv = genRandomBytes(12);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(message),
  );
  assert(encrypted);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );

  assertEquals(new TextDecoder().decode(decrypted), message);
});

Deno.test("genHMACKey() key can sign and verify", async () => {
  const message = "Bob is paranoid";
  const messageBytes = new TextEncoder().encode(message);
  const key = await genHMACKey();
  const signature = await crypto.subtle.sign(
    { name: "HMAC", hash: { name: "SHA-256" } },
    key,
    messageBytes,
  );

  assert(signature);

  const isVerified = await crypto.subtle.verify(
    { name: "HMAC", hash: { name: "SHA-256" } },
    key,
    signature,
    messageBytes,
  );

  assert(isVerified);
});

Deno.test("encrypt() and decrypt() work", async () => {
  const key = await genAESGCMKey();

  const payload = "Alice is paranoid";

  const encrypted = await encrypt(key, payload);

  assertNotEquals(payload, new TextDecoder().decode(encrypted));

  const decrypted = await decrypt(key, encrypted);

  assertEquals(new TextDecoder().decode(decrypted), payload);
});

Deno.test("encryptTimestamp() and decryptTimestamp()", async () => {
  const key = await genAESGCMKey();

  const d = new Date();
  const hexStr = await encryptSeconds(key, d);

  const seconds = await decryptSeconds(key, hexStr);

  assertEquals(seconds, Math.floor(d.getTime() / 1000));
});

Deno.test({
  name: "generatePBKDF2Hash()",
  async fn() {
    const bytes = genRandomBytes(32);
    const hash = await generatePBKDF2Hash(
      new TextEncoder().encode("foo"),
      bytes,
    );

    assertEquals(hash.byteLength, 32);
  },
  sanitizeOps: false,
});

Deno.test("signWithHMAC() signs", async () => {
  const key = await genHMACKey();

  const message = "signing";
  const signature = await signWithHMAC(key, new TextEncoder().encode(message));

  assert(signature);
});

Deno.test("verifyWithHMAC() verifies", async () => {
  const key = await genHMACKey();

  const message = "signing";
  const payload = new TextEncoder().encode(message);
  const signature = await signWithHMAC(key, payload);

  const isVerified = await verifyWithHMAC(
    key,
    new Uint8Array(signature),
    payload,
  );

  assert(isVerified);
});

Deno.test("generateDigitOTP() can support different lengths", () => {
  const val = genDigitOTP();
  assertEquals(val.length, 6);
  const val1 = genDigitOTP(8);
  assertEquals(val1.length, 8);
  const val2 = genDigitOTP(4);
  assertEquals(val2.length, 4);
  const val3 = genDigitOTP(12);
  assertEquals(val3.length, 12);
});

Deno.test("generateDigitOTP() do not equal each other", () => {
  const val1 = genDigitOTP(6);
  const val2 = genDigitOTP(6);
  assertNotEquals(val1, val2);
});

Deno.test("generateDigitOTP() has low repeats", () => {
  const set = new Set();
  for (let i = 0; i < 9999; i++) {
    set.add(genDigitOTP());
  }

  assertGreater(set.size, 9900);
});
