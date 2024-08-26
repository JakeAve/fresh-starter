import { load } from "$std/dotenv/mod.ts";
import { RateLimitError } from "../../Errors/RateLimitError.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

const RATE_LIMIT = ["rate_limit"];

export interface RateLimitRecord {
  ip: string;
  max: number;
  count: number;
}

export interface RateLimit {
  label: string;
  ip: string;
  max: number;
  interval: number;
}

export async function updateRateLimit(
  rateLimit: RateLimit,
): Promise<RateLimitRecord> {
  const { ip, label, max, interval } = rateLimit;

  const intervalKey = Math.floor(
    new Date().getTime() / interval,
  );

  const key = [...RATE_LIMIT, ip, label, intervalKey];

  const res = await kv.get<RateLimitRecord>(key);

  if (!res.value) {
    const rateLimitRecord: RateLimitRecord = {
      ip,
      max,
      count: 1,
    };
    await kv.set(key, rateLimitRecord, { expireIn: interval });
    return rateLimitRecord;
  }

  const { count: recordCount, max: recordMax } = res.value;

  if (recordCount >= recordMax) {
    throw new RateLimitError(new Error(`ip ${ip} exceeded rate ${label}`));
  }

  res.value.count++;

  await kv.set(key, res.value, { expireIn: interval });

  return res.value;
}
