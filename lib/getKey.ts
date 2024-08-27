import "$std/dotenv/load.ts";
import { base64ToUint8 } from "$lib/encoding.ts";

export function getAESKey() {
  const base64Str = Deno.env.get("AES_256_GCM_KEY") as string;
  const raw = base64ToUint8(base64Str);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export function getAccessTokenKey() {
  const base64Str = Deno.env.get("ACCESS_TOKEN_KEY") as string;
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

export function getRefreshTokenKey() {
  const base64Str = Deno.env.get("REFRESH_TOKEN_KEY") as string;
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
