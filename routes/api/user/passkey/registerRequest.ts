import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  POST(_req, ctx) {
    const user = ctx.state.user;
    return new Response(JSON.stringify(user));
  },
};
