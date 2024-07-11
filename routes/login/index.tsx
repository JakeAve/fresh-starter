import { Handlers, PageProps } from "$fresh/server.ts";
import { handler as loginHandler } from "../api/login.ts";
import { AuthenticationError } from "../../Errors/AuthenticationError.ts";
import { setCookie } from "$std/http/cookie.ts";
import LoginForm from "../../islands/LoginForm.tsx";
import { makeAuthHeaders } from "../../lib/authentication.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("X-Custom-Header", "Hello");
    return resp;
  },
  async POST(req, ctx) {
    try {
      const login = await loginHandler.POST?.(req, ctx) as Response;

      const loginResp = await login.json();

      if (!login.ok) {
        throw new AuthenticationError(loginResp.email, loginResp.message);
      }

      const headers = makeAuthHeaders(req, new Headers(), loginResp.token);
      headers.set("location", "/");

      return new Response(null, {
        status: 303,
        headers,
      });
    } catch (err) {
      console.log(err);
      let email = "";
      if (err instanceof AuthenticationError) {
        email = err.email;
      }
      return ctx.render({ message: "Bad credentials.", email });
    }
  },
};

interface Props {
  message?: string;
  email?: string;
}

export default function Home(props: PageProps<Props>) {
  const message = props.data?.message;
  const email = props.data?.email;

  return (
    <>
      <div class="grid place-items-center h-screen relative">
        <LoginForm email={email} message={message} />
      </div>
    </>
  );
}
