import { Handlers } from "$fresh/server.ts";
import { deleteAuthHeaders } from "../../../lib/authentication.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const headers = await deleteAuthHeaders(req, new Headers());

    return new Response(JSON.stringify({ response: "ok" }), {
      headers,
    });
  },
};
