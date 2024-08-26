import { load } from "$std/dotenv/mod.ts";
import { AccessDeniedError } from "../Errors/AccessDeniedError.ts";
import { getUserByEmail } from "./userSchema.ts";

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

const IP_BAN = ["ip_ban_by_ip"];

const MAX_INFRACTIONS_IN_24_HOURS = 3;

export interface IPBan {
  ip: string;
  infractions: number;
  infractionsLast24Hours: number;
  banCount: number;
  userIds: (string | null)[];
  expiresAt: Date | null | "never";
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function addIPInfraction(
  ip: string,
  userId: string | null,
): Promise<IPBan> {
  const byIp = [...IP_BAN, ip];
  const res = await kv.get<IPBan>(byIp);
  const d = new Date();
  if (!res.value) {
    const ban: IPBan = {
      ip,
      userIds: [userId],
      expiresAt: null,
      isBanned: false,
      infractions: 1,
      infractionsLast24Hours: 1,
      createdAt: d,
      updatedAt: d,
      banCount: 0,
    };
    await kv.set(byIp, ban);
    return ban;
  }

  const {
    updatedAt,
    infractions,
    infractionsLast24Hours,
    userIds: savedUserIds,
    banCount,
  } = res.value;

  // Add user
  if (!savedUserIds.includes(userId)) {
    res.value.userIds.push(userId);
  }

  // add infraction
  if (d.getTime() - updatedAt.getTime() < 84_400) {
    res.value.infractionsLast24Hours = infractionsLast24Hours + 1;
  } else {
    res.value.infractionsLast24Hours = 0;
  }

  res.value.infractions = infractions + 1;

  // decide what action to take
  if (banCount >= 3) {
    res.value.isBanned = true;
    res.value.expiresAt = "never";
  }

  if (infractionsLast24Hours >= MAX_INFRACTIONS_IN_24_HOURS) {
    res.value.isBanned = true;
    res.value.expiresAt = new Date(d.getTime() + 84_400);
    res.value.banCount = banCount + 1;
  }

  // save update
  res.value.updatedAt = d;

  await kv.set(byIp, res.value);
  return res.value;
}

export async function verifyIP(
  ip: string,
  email: string | null,
): Promise<true> {
  const byIp = [...IP_BAN, ip];
  const res = await kv.get<IPBan>(byIp);
  if (!res.value) {
    return true;
  }

  const {
    userIds: savedUserIds,
    expiresAt,
  } = res.value;

  if (!expiresAt) {
    return true;
  }

  if (expiresAt === "never") {
    throw new AccessDeniedError(
      new Error(`Permanent IP ban: ${ip}. Users: ${savedUserIds}`),
    );
  }

  const d = new Date();

  if (d.getTime() < expiresAt.getTime()) {
    throw new AccessDeniedError(
      new Error(`IP ${ip} banned until ${expiresAt.toUTCString()}`),
    );
  }

  res.value.isBanned = false;
  res.value.expiresAt = null;
  res.value.updatedAt = d;
  if (email) {
    const user = await getUserByEmail(email);
    if (user) {
      res.value.userIds.push(user.id);
    }
  }
  await kv.set(byIp, res.value);

  return true;
}
