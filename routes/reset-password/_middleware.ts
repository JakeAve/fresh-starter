import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { verifyOTC } from "../../db/passwordResetSchema.ts";
import { getUserByEmail } from "../../db/userSchema.ts";
import { randomTimeout } from "../../lib/utils/randomTimeout.ts";
import { RESET_PASSWORD_COOKIE_NAME } from "../verify-password-reset/index.tsx";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  await randomTimeout(1000);

  try {
    const url = new URL(req.url);

    const email = url.searchParams.get("email");
    if (!email) {
      throw new Deno.errors.NotFound();
    }
    ctx.state.email = email;

    const otc = getCookies(req.headers)[RESET_PASSWORD_COOKIE_NAME];
    if (!otc) {
      throw new Deno.errors.NotFound();
    }
    ctx.state.otc = otc;

    const user = await getUserByEmail(email);
    if (!user) {
      throw new Deno.errors.NotFound();
    }
    ctx.state.rawUser = user;

    try {
      await verifyOTC(user.id, otc);
    } catch {
      throw new Deno.errors.NotFound();
    }
    ctx.state.error = false;

    return ctx.next();
  } catch {
    ctx.state.error = true;
    return ctx.next();
  }
}
