import { FreshContext, Handlers } from "$fresh/server.ts";
import { SanitizedUser, updateUserByEmail } from "$kv/userSchema.ts";
import { ValidationError } from "../../../Errors/ValidationError.ts";
import { internalServerErrorResponse } from "../../../lib/utils/internalServerErrorResponse.ts";
import { validateName } from "../../../lib/validators/validateName.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    const user = ctx.state.user as SanitizedUser;

    return new Response(JSON.stringify({ handle: user.handle }));
  },
  async PUT(req: Request, ctx: FreshContext) {
    try {
      const json = await req.json();
      const { name } = json;

      const user = ctx.state.user as SanitizedUser;

      validateName(name);

      await updateUserByEmail(user.email, { name });

      return new Response(
        JSON.stringify({
          response: "ok",
          name,
          message: `Updated to ${name}`,
        }),
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        return new Response(JSON.stringify({ message: err.message }), {
          status: 400,
        });
      }
      return internalServerErrorResponse(err);
    }
  },
};
