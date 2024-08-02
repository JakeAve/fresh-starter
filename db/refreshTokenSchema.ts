import { load } from "$std/dotenv/mod.ts";

const REFRESH_TOKEN_BY_USER_ID: Deno.KvKey = ["refresh_tokens"];

export interface RefreshToken {
    token: string;
    version: number;
}

export class RefreshToken extends Error {
    constructor(message: string) {
        super(message);
    }
}

const env = await load();

const kv = await Deno.openKv(env.KV_PATH);

export async function addRefreshToken(
    userId: string,
    refreshToken: RefreshToken,
) {
    const res = await kv.set(
        [...REFRESH_TOKEN_BY_USER_ID, userId],
        refreshToken,
        { expireIn: 1000 * 60 * 60 * 24 * 30 },
    );

    if (!res.ok) {
        throw new RefreshToken(`Could not add refresh token: ${userId}`);
    }
}

export async function getRefreshTokenByUserId(userId: string) {
    const res = await kv.get<RefreshToken>([
        ...REFRESH_TOKEN_BY_USER_ID,
        userId,
    ]);
    return res.value;
}

export async function incrementRefreshToken(userId: string) {
    const token = await getRefreshTokenByUserId(userId);

    if (!token) {
        throw new RefreshToken(`Could not get refresh token: ${userId}`);
    }

    token.version = token.version + 1;
    const set = await kv.set([...REFRESH_TOKEN_BY_USER_ID, userId], token);
    if (!set.ok) {
        throw new RefreshToken(`Could not update version for: ${userId}`);
    }
}
