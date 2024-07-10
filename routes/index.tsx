import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const resp = await ctx.render();
    const cookies = getCookies(req.headers);
    const userToken = cookies["user-token"];
    if (userToken) {
      return resp;
    } else {
      const headers = new Headers();
      headers.set("location", "/login");
      return new Response(null, {
        status: 303,
        headers,
      });
    }
  },
};

interface Props {
  message?: string;
}

export default function Home(_props: PageProps<Props>) {
  return (
    <div class="grid place-items-center h-screen">
      <h1>Home</h1>
    </div>
  );
}
