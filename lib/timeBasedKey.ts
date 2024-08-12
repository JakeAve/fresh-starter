import { decryptSeconds, encryptSeconds } from "./cryptoHelpers.ts";
import { secondsToDate } from "./secondsTimeStamp.ts";

/**
 * @param {CryptoKey} key - aes-256-gcm key
 * @param {Number} expiresIn - times in seconds
 * @returns {Promise<String>}
 */
export function createTimeBasedKey(
  key: CryptoKey,
  expiresIn: number,
): Promise<string> {
  const d = new Date(new Date().getTime() + (expiresIn * 1000));
  return encryptSeconds(key, d);
}

class ExpiredTimeBasedKey extends Error {
  constructor(message: string) {
    super(message);
  }
}

class InvalidTimeBasedKey extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function verifyTimeBasedKey(key: CryptoKey, timeBasedKey: string) {
  try {
    const expInSeconds = await decryptSeconds(key, timeBasedKey);
    const isExpired =
      secondsToDate(expInSeconds).getTime() <= new Date().getTime();

    if (isExpired) {
      throw new ExpiredTimeBasedKey("Time based key is expired");
    }

    return true;
  } catch (err) {
    if (err instanceof ExpiredTimeBasedKey) {
      throw err;
    }
    throw new InvalidTimeBasedKey("Invalid");
  }
}
