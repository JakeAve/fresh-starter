import { Handlers, PageProps } from "$fresh/server.ts";
import { Button } from "$components/Button.tsx";
import routes from "../routes.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    if (ctx.state.isAuthenticated) {
      return ctx.render();
    } else {
      const headers = new Headers();
      headers.set("location", routes.login.index);
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
      <a href={routes.account.index}>Go to account</a>
      <form method="post" action={routes.api.auth.logout}>
        <Button>Logout</Button>
      </form>
    </div>
  );
}
