import { dateToSeconds } from "./secondsTimeStamp.ts";

const DEFAULT_SALT_BYTE_LENGTH = 32;
const DEFAULT_PBKDF2_ITERATIONS = 999999;

export function genRandomBytes(byteLength = DEFAULT_SALT_BYTE_LENGTH) {
  const arr = new Uint8Array(byteLength);
  return crypto.getRandomValues(arr);
}

export function genAESGCMKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export function integerTo32Bits(n: number) {
  if (n < 0 || n > 4294967295) {
    throw new Error("Must be between 0 and 4294967295");
  }
  const byte1 = n & 0xff;
  const byte2 = (n >> 8) & 0xff;
  const byte3 = (n >> 16) & 0xff;
  const byte4 = (n >> 24) & 0xff;
  return new Uint8Array([byte1, byte2, byte3, byte4]);
}

export function _32BitsToInteger(bytes: Uint8Array) {
  if (bytes.length !== 4) {
    throw new Error("Must be Uint8Array length of 4");
  }
  const view = new DataView(bytes.buffer, 0);
  return view.getUint32(0, true);
}

export async function encrypt(key: CryptoKey, payload: string | BufferSource) {
  const iv = genRandomBytes(12);

  if (typeof payload === "string") {
    payload = new TextEncoder().encode(payload);
  }

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payload,
  );

  return bytesToHexStr(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
}

export function decrypt(key: CryptoKey, hex: string) {
  const arr = hexStrToUint8(hex);
  const iv = arr.slice(0, 12);
  const payload = arr.slice(12).buffer;

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    payload,
  );
}

export function encryptSeconds(key: CryptoKey, date = new Date()) {
  const timestamp = integerTo32Bits(dateToSeconds(date));
  return encrypt(key, timestamp);
}

export async function decryptSeconds(key: CryptoKey, hex: string) {
  const arr = await decrypt(key, hex);
  return _32BitsToInteger(new Uint8Array(arr));
}

export function hexStrToUint8(hex: string) {
  return new Uint8Array(
    (hex.match(/.{1,2}/g) as RegExpMatchArray).map((h) => parseInt(h, 16)),
  );
}

export function bytesToHexStr(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function base64ToUint8(base64Str: string) {
  return Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
}

export function bytesToBase64Str(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

export async function generatePBKDF2Hash(
  password: Uint8Array,
  salt: Uint8Array,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    password,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  try {
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      256,
    );
  } catch (err) {
    console.log(err);
    throw new Error("Could not hash");
  }
}

export async function hashPassword(
  password: string,
  saltBytes = DEFAULT_SALT_BYTE_LENGTH,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
) {
  const salt = genRandomBytes(saltBytes);
  const passwordBytes = new TextEncoder().encode(password);
  const hash = await generatePBKDF2Hash(passwordBytes, salt, iterations);
  const combined = new Uint8Array([...salt, ...new Uint8Array(hash)]);
  return bytesToHexStr(combined);
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  saltBytes = DEFAULT_SALT_BYTE_LENGTH,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
) {
  try {
    const passwordBytes = new TextEncoder().encode(password);
    const saltAndPassword = hexStrToUint8(storedHash);
    const salt = saltAndPassword.slice(0, saltBytes);
    const hash = saltAndPassword.slice(saltBytes);
    const comparedHash = await generatePBKDF2Hash(
      passwordBytes,
      salt,
      iterations,
    );

    new Uint8Array(comparedHash).forEach((int, i) => {
      if (int !== hash[i]) {
        throw new Error("Hashes do not match");
      }
    });

    return true;
  } catch (err) {
    console.log(err);
    throw new Error("Could not verify password");
  }
}
