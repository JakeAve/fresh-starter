import { FreshContext } from "$fresh/server.ts";
import { verifyIP } from "../db/ipBanSchema.ts";
import { updateRateLimit } from "../db/rateLimitSchema.ts";
import { AccessDeniedError } from "../Errors/AccessDeniedError.ts";
import { RateLimitError } from "../Errors/RateLimitError.ts";
import { makeAuthHeaders, validateAuthHeaders } from "../lib/authentication.ts";
import { accessDeniedErrorResponse } from "../lib/utils/accessDeniedErrorResponse.ts";
import { getIPAddress } from "../lib/utils/getIPAddress.ts";
import { internalServerErrorResponse } from "../lib/utils/internalServerErrorResponse.ts";
import { rateLimitErrorResponse } from "../lib/utils/rateLimitErrorResponse.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  if (ctx.destination === "internal" || ctx.destination === "static") {
    return ctx.next();
  }

  try {
    try {
      const { sub } = await validateAuthHeaders(req);
      ctx.state.isAuthenticated = true;
      ctx.state.email = sub;
    } catch {
      ctx.state.isAuthenticated = false;
    }

    ctx.state.ip = getIPAddress(req, ctx);

    await verifyIP(ctx.state.ip as string, ctx.state.email as string);

    await updateRateLimit({
      label: "main",
      ip: ctx.state.ip as string,
      max: 50,
      interval: 6000,
    });

    const resp = await ctx.next();

    if (ctx.state.isAuthenticated && ctx.state.email) {
      await makeAuthHeaders(req, resp.headers, ctx.state.email as string);
    }

    return resp;
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return accessDeniedErrorResponse(err);
    }
    if (err instanceof RateLimitError) {
      return rateLimitErrorResponse(err, ctx);
    }
    return internalServerErrorResponse(err);
  }
}
