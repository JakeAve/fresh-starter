export function getKey() {
  const base64Str = Deno.env.get("AES_256_GCM_KEY") as string;
  const raw = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}
