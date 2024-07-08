import { base64ToUint8 } from "./cryptoHelpers.ts";

export function getAESKey() {
  const base64Str = Deno.env.get("AES_256_GCM_KEY") as string;
  const raw = base64ToUint8(base64Str);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}
