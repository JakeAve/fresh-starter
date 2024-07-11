import { base64ToUint8 } from "./cryptoHelpers.ts";

import "$std/dotenv/load.ts";

export function getAESKey() {
  const base64Str = Deno.env.get("AES_256_GCM_KEY") as string;
  const raw = base64ToUint8(base64Str);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export function getHMACKey() {
  const base64Str = Deno.env.get("HMAC_SHA_256_KEY") as string;
  const raw = base64ToUint8(base64Str);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    [
      "sign",
      "verify",
    ],
  );
}
