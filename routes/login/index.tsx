import { Login } from "$components/Login.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";
import { authenticate } from "../../db/userSchema.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("X-Custom-Header", "Hello");
    return resp;
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    if (!email || !password) {
      return ctx.render({ message: "Enter email and password" });
    }

    const didAuthenticate = await authenticate(email, password);

    if (didAuthenticate) {
      const headers = new Headers();
      console.log({ didAuthenticate });
      headers.set("location", `/greet/${didAuthenticate.name}`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }
    return ctx.render({ message: "Bad credentials" });
  },
};

interface Props {
  message?: string;
}

export default function Home(props: PageProps<Props>) {
  const message = props.data?.message;
  return (
    <div class="grid place-items-center h-screen">
      {message && <span>{message}</span>}
      <Login />
    </div>
  );
}
