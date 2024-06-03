import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("X-Custom-Header", "Hello");
    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
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
