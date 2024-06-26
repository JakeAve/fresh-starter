export function genRandomBytes(byteLength = 32) {
  const arr = new Uint8Array(byteLength);
  return crypto.getRandomValues(arr);
}

export function genSigningKeys() {
  return crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
}

export async function genSignature(privateKey: CryptoKey) {
  const bytes = genRandomBytes(32);
  const signature = await crypto.subtle.sign("Ed25519", privateKey, bytes);
  const signArr = new Uint8Array(signature);
  const combined = new Uint8Array(bytes.length + signArr.length);
  combined.set(bytes);
  combined.set(signArr, bytes.length);
  console.log({arr: combined, bytes, signature});
  const hexStr = Array.from(combined)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hexStr;
}

export function verifySignature(hex: string, publicKey: CryptoKey) {
  const arr = new Uint8Array(
    (hex.match(/[0-9a-f]{2}/gi) as RegExpMatchArray).map((h) =>
      parseInt(h, 16)
    ),
  );
  const bytes = arr.slice(0, 32);
  const signature = arr.slice(32).buffer;
  console.log({ arr, bytes, signature });
  return crypto.subtle.verify("Ed25519", publicKey, signature, bytes);
}
