import { FreshContext } from "$fresh/server.ts";

export function handler(
  _req: Request,
  ctx: FreshContext,
) {
  return ctx.next();
}
