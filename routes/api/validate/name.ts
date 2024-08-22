import { FreshContext, Handlers } from "$fresh/server.ts";
import { ValidationError } from "../../../Errors/ValidationError.ts";
import { internalServerErrorResponse } from "../../../lib/utils/internalServerErrorResponse.ts";
import { validateName } from "../../../lib/validators/validateName.ts";

export const handler: Handlers = {
  async POST(req: Request, _ctx: FreshContext) {
    try {
      const json = await req.json();
      const { name } = json;

      validateName(name);

      return new Response(JSON.stringify({ response: "ok" }));
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
