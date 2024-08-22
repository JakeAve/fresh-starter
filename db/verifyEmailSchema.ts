import { load } from "$std/dotenv/mod.ts";
import { bytesToBase64Url, genRandomBytes } from "../lib/cryptoHelpers.ts";

const EMAIL_VERIFICATION: Deno.KvKey = ["email_verification"];

export interface EmailVerification {
  userEmail: string;
  userId: string;
  otc: string;
  isVerified: boolean;
}

export type EmailVerificationBody = Omit<
  EmailVerification,
  "otc" | "isVerified"
>;

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

export async function addEmailVerification(
  emailVerificationBody: EmailVerificationBody,
): Promise<EmailVerification> {
  const otc = bytesToBase64Url(genRandomBytes(32));

  const emailVerification: EmailVerification = {
    ...emailVerificationBody,
    otc,
    isVerified: false,
  };

  const key = [...EMAIL_VERIFICATION, emailVerificationBody.userEmail];

  const res = await kv.set(key, emailVerification);

  if (!res.ok) {
    throw new Error("Cannot save email verification");
  }

  return emailVerification;
}

export async function getEmailVerification(
  emailAddress: string,
): Promise<EmailVerification | null> {
  const res = await kv.get<EmailVerification>([
    ...EMAIL_VERIFICATION,
    emailAddress,
  ]);
  return res.value;
}

export class EmailVerificationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function verifyEmail(
  emailAddress: string,
  otc: string,
): Promise<EmailVerification> {
  const record = await getEmailVerification(emailAddress);
  if (!record) {
    throw new EmailVerificationError("No account associated with email");
  }
  if (record.isVerified) {
    throw new EmailVerificationError("Email is already verified");
  }
  if (record.otc !== otc) {
    throw new EmailVerificationError("OTC is incorrect");
  }
  const key = [...EMAIL_VERIFICATION, emailAddress];

  record.isVerified = true;

  await kv.set(key, record);

  return record;
}
