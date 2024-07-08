import { FreshContext } from "$fresh/server.ts";
import { getAESKey } from "../../../lib/getKey.ts";
import { verifyTimeBasedKey } from "../../../lib/timeBasedKey.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  try {
    const json = await req.json();
    const { token } = json;
    ctx.state.email = json.email;
    const key = await getAESKey();
    await verifyTimeBasedKey(key, token);
    const resp = await ctx.next();
    return resp;
  } catch (err) {
    if (err) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 400,
      });
    }
  }
}
