import {
  _32BitsToInteger,
  bytesToHexStr,
  hexStrToUint8,
  integerTo32Bits,
} from "$lib/encoding.ts";
import { dateToSeconds } from "$lib/secondsTimeStamp.ts";

export function genRandomBytes(byteLength = 32) {
  const arr = new Uint8Array(byteLength);
  return crypto.getRandomValues(arr);
}

export function genAESGCMKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export function genHMACKey() {
  return crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, true, [
    "sign",
    "verify",
  ]);
}

export async function encrypt(
  key: CryptoKey,
  payload: string | BufferSource,
): Promise<Uint8Array> {
  const iv = genRandomBytes(12);

  if (typeof payload === "string") {
    payload = new TextEncoder().encode(payload);
  }

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payload,
  );

  return new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
}

export function decrypt(
  key: CryptoKey,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  const iv = data.slice(0, 12);
  const payload = data.slice(12).buffer;

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    payload,
  );
}

export async function encryptSeconds(
  key: CryptoKey,
  date = new Date(),
): Promise<string> {
  const timestamp = integerTo32Bits(dateToSeconds(date));
  const data = await encrypt(key, timestamp);
  return bytesToHexStr(data);
}

export async function decryptSeconds(
  key: CryptoKey,
  hex: string,
): Promise<number> {
  const data = hexStrToUint8(hex);
  const arr = await decrypt(key, data);
  return _32BitsToInteger(new Uint8Array(arr));
}

export async function generatePBKDF2Hash(
  password: Uint8Array,
  salt: Uint8Array,
  iterations = 999999,
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
    console.error(err);
    throw new Error("Could not hash");
  }
}

export function signWithHMAC(key: CryptoKey, payload: Uint8Array) {
  return crypto.subtle.sign(
    { name: "HMAC", hash: { name: "SHA-256" } },
    key,
    payload,
  );
}

export function verifyWithHMAC(
  key: CryptoKey,
  signature: Uint8Array,
  payload: Uint8Array,
) {
  return crypto.subtle.verify(
    { name: "HMAC", hash: { name: "SHA-256" } },
    key,
    signature,
    payload,
  );
}

export function genDigitOTP(length = 6) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const otp = Array.from(array, (byte) => byte % 10).join("");
  return otp.slice(0, length);
}
