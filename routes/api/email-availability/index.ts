import { FreshContext, Handlers } from "$fresh/server.ts";
import { getUserByEmail } from "../../../db/userSchema.ts";
import { validateEmail } from "../../../lib/validateEmail.ts";

export const handler: Handlers = {
  async POST(_req: Request, ctx: FreshContext) {
    try {
      const email = ctx.state.email as string;
      if (!email) {
        throw new Error("Email cannot be blank.");
      }
      const isValid = validateEmail(email);
      if (!isValid) {
        throw new Error(`Invalid email: ${email}`);
      }
      const user = await getUserByEmail(email);
      if (!user) {
        return new Response(
          JSON.stringify({ response: "ok" }),
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
