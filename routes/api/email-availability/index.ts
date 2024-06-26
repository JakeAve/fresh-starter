import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByEmail } from "../../../db/userSchema.ts";

export const handler: Handlers = {
  async POST(_req: Request, ctx: FreshContext) {
    try {
      // const json = await req.json();
      const email = ctx.state.email as string;
      if (!email) {
        throw new Error("Email cannot be blank.");
      }
      const user = await getUserByEmail(email);
      if (!user) {
        return new Response(
          JSON.stringify({ response: "ok", message: `${email} is available.` }),
        );
      }
      throw new Error(`${email} is already taken.`);
    } catch (err) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 409,
      });
    }
  },
};
