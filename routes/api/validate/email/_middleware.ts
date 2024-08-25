import { FreshContext } from "$fresh/server.ts";
import { getAESKey } from "../../../../lib/getKey.ts";
import {
  ExpiredTimeBasedKey,
  InvalidTimeBasedKey,
  verifyTimeBasedKey,
} from "../../../../lib/timeBasedKey.ts";
import { accessDeniedErrorResponse } from "../../../../lib/utils/accessDeniedErrorResponse.ts";
import { internalServerErrorResponse } from "../../../../lib/utils/internalServerErrorResponse.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  try {
    const json = await req.json();
    const { token } = json;
    ctx.state.updatedEmail = json.email;
    const key = await getAESKey();
    await verifyTimeBasedKey(key, token);
    return ctx.next();
  } catch (err) {
    if (
      err instanceof ExpiredTimeBasedKey || err instanceof InvalidTimeBasedKey
    ) {
      return accessDeniedErrorResponse(err);
    }
    return internalServerErrorResponse(err);
  }
}
