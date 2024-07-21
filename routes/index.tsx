import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { TOKEN_COOKIE_NAME } from "../lib/authentication.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const resp = await ctx.render();
    const cookies = getCookies(req.headers);
    const userToken = cookies[TOKEN_COOKIE_NAME];
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
      <a href="/account">Go to account</a>
      <form method="post" action="/api/logout">
        <button>Logout</button>
      </form>
    </div>
  );
}
