import { FreshContext, Handlers } from "$fresh/server.ts";
import {
  checkPasswordStrength,
  WeakPasswordError,
} from "../../lib/passwordStrength.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const json = await req.json();
      const { password } = json;
      try {
        const strength = await checkPasswordStrength(password);
        return new Response(JSON.stringify(strength));
      } catch (err) {
        if (err instanceof WeakPasswordError) {
          const weakErr = err as WeakPasswordError;
          return new Response(
            JSON.stringify({
              ...weakErr.responseBody,
              message: weakErr.message,
            }),
          );
        }
        throw err;
      }
    } catch (err) {
      return new Response(JSON.stringify({ message: err.message }), {
        status: 500,
      });
    }
  },
};
