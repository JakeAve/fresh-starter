import { monotonicUlid } from "$std/ulid/mod.ts";
import { load } from "$std/dotenv/mod.ts";
import { getUserById } from "$kv/userSchema.ts";
import {
  genDigitOTP,
  genRandomBytes,
} from "$lib/cryptoHelpers.ts";
import { bytesToBase64Str } from "$lib/encoding.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

export interface PasswordResetRequest {
  id: string;
  email: string;
  userId: string;
  otp: string;
  attempts: number;
  isVerified: boolean;
  isPasswordReset: boolean;
  otc: null | string;
}

export class PasswordResetError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const PASSWORD_RESET_REQUEST: Deno.KvKey = [
  "reset_password_request_by_user_id",
];

const TTL = 1000 * 60 * 15;

export async function addResetRequest(
  userId: string,
): Promise<PasswordResetRequest> {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error(`No user found with ID: ${userId}`);
  }

  const id = monotonicUlid();
  const otp = genDigitOTP(6);
  const byUserId = [...PASSWORD_RESET_REQUEST, userId];

  const passwordResetRequest: PasswordResetRequest = {
    id,
    email: user.email,
    userId,
    otp,
    attempts: 0,
    isVerified: false,
    isPasswordReset: false,
    otc: null,
  };

  const res = await kv.set(byUserId, passwordResetRequest, { expireIn: TTL });

  if (!res.ok) {
    console.error("Cannot save", res);
    throw new Error(`Could not save challenge`);
  }

  return passwordResetRequest;
}

export async function verifyOTP(userId: string, otp: string) {
  const key = [...PASSWORD_RESET_REQUEST, userId];
  try {
    const resp = await kv.get<PasswordResetRequest>(key);
    const resetRequest = resp.value;
    if (!resetRequest) {
      throw new Error("No request exists");
    }
    const { attempts, otp: savedOtp, isVerified, isPasswordReset } =
      resetRequest;
    resetRequest.attempts = attempts + 1;
    if (attempts > 6) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("Max attempts reached");
    }
    if (otp !== savedOtp) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("Incorrect pin");
    }
    if (isVerified || isPasswordReset) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("Code already used");
    }
    resetRequest.isVerified = true;
    const randomBytes = genRandomBytes(24);
    resetRequest.otc = bytesToBase64Str(randomBytes);
    await kv.set(key, resetRequest, { expireIn: TTL });
    return resetRequest;
  } catch (err) {
    console.error(err);
    if (err.message.includes("attempts")) {
      throw new PasswordResetError(
        "Max attempts reached. You will need to send a new reset code to your email.",
      );
    }
    throw new PasswordResetError("Could not verify OTP");
  }
}

export async function verifyOTC(
  userId: string,
  otc: string,
  { willInvalidateOTC = false } = {},
) {
  const key = [...PASSWORD_RESET_REQUEST, userId];
  try {
    const resp = await kv.get<PasswordResetRequest>(key);
    const resetRequest = resp.value;
    if (!resetRequest) {
      throw new Error("No request exists");
    }
    const { otc: savedOTC, isVerified, isPasswordReset } = resetRequest;

    if (!isVerified) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("OTP has not been verified");
    }

    if (isPasswordReset) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("OTC already used");
    }

    if (otc !== savedOTC) {
      await kv.set(key, resetRequest, { expireIn: TTL });
      throw new Error("Incorrect OTC");
    }

    if (willInvalidateOTC) {
      resetRequest.isPasswordReset = true;
      await kv.set(key, resetRequest, { expireIn: TTL });
    }

    return resetRequest;
  } catch (err) {
    console.error(err);
    throw new PasswordResetError("Could not verify OTC");
  }
}
