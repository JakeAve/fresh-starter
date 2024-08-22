import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { AuthenticationError } from "../Errors/AuthenticationError.ts";
import {
  getUserByEmail,
  incrementRefreshTokenVersion,
} from "../db/userSchema.ts";
import { verifyPassword } from "./cryptoHelpers.ts";
import { JWT, JWTError, signJwt, verifyJwt } from "./jwt.ts";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

export const ACCESS_TOKEN_COOKIE_NAME = "user_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

export async function authenticate(email: string, password: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AuthenticationError(email);
    }

    await verifyPassword(password, user.password);

    return user;
  } catch (err) {
    console.error(err);
    throw new AuthenticationError(email);
  }
}

interface AuthHeadersOptions {
  updateRefreshToken: boolean;
  refreshTokenVersion?: number;
}

export async function makeAuthHeaders(
  req: Request,
  headers: Headers,
  email: string,
  opts: AuthHeadersOptions = { updateRefreshToken: false },
): Promise<
  { headers: Headers; accessToken: string; refreshToken: string | undefined }
> {
  const url = new URL(req.url);

  const proms: Promise<string>[] = [signJwt({
    sub: email,
    iss: new URL(req.url).href,
    aud: "api",
    expiresIn: 1000 * 60 * 15,
  })];

  const { updateRefreshToken, refreshTokenVersion } = opts;

  if (updateRefreshToken && refreshTokenVersion) {
    proms.push(
      signJwt({
        sub: email,
        iss: new URL(req.url).href,
        aud: "api",
        expiresIn: 1000 * 60 * 60 * 24 * 30,
        version: refreshTokenVersion as number,
      }),
    );
  }

  const [accessToken, refreshToken] = await Promise.all(proms);

  setCookie(headers, {
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: accessToken,
    maxAge: 3600,
    domain: url.hostname,
    path: "/",
    secure: env.APP_ENVIRONMENT === "production" ? true : false,
  });

  if (updateRefreshToken && refreshToken) {
    setCookie(headers, {
      name: REFRESH_TOKEN_COOKIE_NAME,
      value: refreshToken,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      domain: url.hostname,
      path: "/",
      secure: env.APP_ENVIRONMENT === "production" ? true : false,
    });
  }

  return { headers, accessToken, refreshToken };
}

export async function deleteAuthHeaders(
  req: Request,
  headers: Headers,
) {
  const url = new URL(req.url);

  deleteCookie(headers, ACCESS_TOKEN_COOKIE_NAME, {
    path: "/",
    domain: url.hostname,
  });

  deleteCookie(headers, REFRESH_TOKEN_COOKIE_NAME, {
    path: "/",
    domain: url.hostname,
  });

  let jwt: JWT | undefined;

  try {
    const accessToken = getCookies(req.headers)[ACCESS_TOKEN_COOKIE_NAME];
    const refreshToken = getCookies(req.headers)[REFRESH_TOKEN_COOKIE_NAME];

    const token = refreshToken || accessToken;

    jwt = await verifyJwt(token);
  } catch (err) {
    if (err instanceof JWTError) {
      jwt = err.payload;
    }
  }

  if (jwt) {
    await incrementRefreshTokenVersion(jwt.sub);
  }

  return headers;
}

export async function validateAuthHeaders(
  req: Request,
) {
  const accessToken = getCookies(req.headers)[ACCESS_TOKEN_COOKIE_NAME];

  let jwt: JWT | undefined;
  try {
    jwt = await verifyJwt(accessToken);
  } catch {
    try {
      const refreshToken = getCookies(req.headers)[REFRESH_TOKEN_COOKIE_NAME];
      const validRefreshToken = await verifyJwt(refreshToken);

      const { sub } = validRefreshToken;

      const user = await getUserByEmail(sub);

      if (!user) {
        throw new Error(`No user: ${sub}`);
      }

      if (user.refreshTokenVersion !== (validRefreshToken.version as number)) {
        throw new Error(`Tokens do not match`);
      }

      jwt = validRefreshToken;
    } catch (err) {
      console.error(err);
      throw new Error("Cannot authenticate");
    }
  }

  return jwt;
}
