import { FreshContext } from "$fresh/server.ts";
import { validateAuthHeaders } from "../lib/authentication.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  if (ctx.destination === "internal" || ctx.destination === "static") {
    return ctx.next();
  }

  let isAuthenticated = false;
  let email: null | string = null;

  try {
    const { sub } = await validateAuthHeaders(req);
    email = sub;
    isAuthenticated = true;
  } catch {
    //
  }

  ctx.state.isAuthenticated = isAuthenticated;
  ctx.state.email = email;

  return ctx.next();
}
