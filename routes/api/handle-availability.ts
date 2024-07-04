import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByHandle } from "../../db/userSchema.ts";
import { validateHandle } from "../../lib/validators/validateHandle.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const json = await req.json();
      const { handle } = json;
      if (!handle) {
        throw new Error("Handle cannot be blank.");
      }
      const isValid = validateHandle(handle);
      if (!isValid) {
        throw new Error('Handle must only use letters, numbers and underscores(_). Must be between 3 and 30 characters long.')
      }
      const user = await getUserByHandle(handle);
      if (!user) {
        return new Response(
          JSON.stringify({ response: "ok", message: `@${handle} is available.` }),
        );
      }
      throw new Error(`@${handle} is already taken.`);
    } catch (err) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 409,
      });
    }
  },
};
