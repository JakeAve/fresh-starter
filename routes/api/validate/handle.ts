import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByHandle } from "../../../db/userSchema.ts";
import { ConflictError } from "../../../Errors/ConflictError.ts";
import { validateHandle } from "../../../lib/validators/validateHandle.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const json = await req.json();
      const { handle } = json;

      validateHandle(handle);

      const user = await getUserByHandle(handle);
      if (!user) {
        return new Response(
          JSON.stringify({
            response: "ok",
            message: `@${handle} is available.`,
          }),
        );
      }
      throw new ConflictError(`@${handle} is already taken.`);
    } catch (err) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: err instanceof ConflictError ? 409 : 400,
      });
    }
  },
};
