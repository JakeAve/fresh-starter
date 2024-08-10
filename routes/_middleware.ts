import { FreshContext } from "$fresh/server.ts";
import { makeAuthHeaders, validateAuthHeaders } from "../lib/authentication.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  if (ctx.destination === "internal" || ctx.destination === "static") {
    return ctx.next();
  }

  try {
    const { sub } = await validateAuthHeaders(req);
    ctx.state.isAuthenticated = true;
    ctx.state.email = sub;
  } catch {
    ctx.state.isAuthenticated = false;
  }

  const resp = await ctx.next();

  if (ctx.state.isAuthenticated && ctx.state.email) {
    await makeAuthHeaders(req, resp.headers, ctx.state.email as string);
  }

  return resp;
}
