import { FreshContext } from "$fresh/server.ts";
import { addIPInfraction } from "../../db/ipBanSchema.ts";
import { getUserByEmail } from "../../db/userSchema.ts";
import { RateLimitError } from "../../Errors/RateLimitError.ts";

export async function rateLimitErrorResponse(err: Error, ctx: FreshContext) {
  const error = new RateLimitError(err);

  const user = ctx.state.email
    ? await getUserByEmail(ctx.state.email as string)
    : null;

  await addIPInfraction(ctx.state.ip as string, user?.id || null);

  return new Response(JSON.stringify({ message: error.message }), {
    status: 429,
  });
}
