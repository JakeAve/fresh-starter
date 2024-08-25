import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByEmail } from "../../../../db/userSchema.ts";
import { ValidationError } from "../../../../Errors/ValidationError.ts";
import { internalServerErrorResponse } from "../../../../lib/utils/internalServerErrorResponse.ts";
import { randomTimeout } from "../../../../lib/utils/randomTimeout.ts";
import { validateEmail } from "../../../../lib/validators/validateEmail.ts";

export const handler: Handlers = {
  async POST(_req: Request, ctx: FreshContext) {
    try {
      await randomTimeout(750);

      const email = ctx.state.updatedEmail as string;

      validateEmail(email);

      const user = await getUserByEmail(email.toLocaleLowerCase());
      if (user) {
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
      return internalServerErrorResponse(err);
    }
  },
};
