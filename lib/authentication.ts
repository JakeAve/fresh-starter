import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { AuthenticationError } from "../Errors/AuthenticationError.ts";
import { getUserByEmail } from "../db/userSchema.ts";
import { verifyPassword } from "./cryptoHelpers.ts";
import { verifyJwt } from "./jwt.ts";

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

export function makeAuthHeaders(
  req: Request,
  headers: Headers,
  accessToken: string,
  refreshToken: string,
) {
  const url = new URL(req.url);
  setCookie(headers, {
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: accessToken,
    maxAge: 3600,
    domain: url.hostname,
    path: "/",
    // secure: true,
  });

  setCookie(headers, {
    name: REFRESH_TOKEN_COOKIE_NAME,
    value: refreshToken,
    maxAge: 3600,
    domain: url.hostname,
    path: "/",
    // secure: true,
  });

  return headers;
}

export function deleteAuthHeaders(
  req: Request,
  headers: Headers,
) {
  const url = new URL(req.url);

  deleteCookie(headers, ACCESS_TOKEN_COOKIE_NAME, { path: "/", domain: url.hostname });

  return headers;
}

export function validateAuthHeaders(
  req: Request,
) {
  const token = getCookies(req.headers)[ACCESS_TOKEN_COOKIE_NAME];

  return verifyJwt(token);
}
