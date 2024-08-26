import { FreshContext, Handlers } from "$fresh/server.ts";
import { updateRateLimit } from "$kv/rateLimitSchema.ts";
import { getUserByEmail } from "$kv/userSchema.ts";
import { RateLimitError } from "../../../../Errors/RateLimitError.ts";
import { ValidationError } from "../../../../Errors/ValidationError.ts";
import { internalServerErrorResponse } from "../../../../lib/utils/internalServerErrorResponse.ts";
import { randomTimeout } from "../../../../lib/utils/randomTimeout.ts";
import { rateLimitErrorResponse } from "../../../../lib/utils/rateLimitErrorResponse.ts";
import { validateEmail } from "../../../../lib/validators/validateEmail.ts";

export const handler: Handlers = {
  async POST(_req: Request, ctx: FreshContext) {
    try {
      await randomTimeout(750);

      const email = ctx.state.updatedEmail as string;

      validateEmail(email);

      const user = await getUserByEmail(email.toLocaleLowerCase());
      if (user) {
        await updateRateLimit({
          label: "email_lookup",
          ip: ctx.state.ip as string,
          max: 3,
          interval: 300_000,
        });

        return new Response(
          JSON.stringify({ message: `${email} is already taken.` }),
          { status: 409 },
        );
      }
      return new Response(
        JSON.stringify({ response: "ok" }),
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        return new Response(
          JSON.stringify({ message: err.message }),
          {
            status: 400,
          },
        );
      }
      if (err instanceof RateLimitError) {
        return rateLimitErrorResponse(err, ctx);
      }
      return internalServerErrorResponse(err);
    }
  },
};
