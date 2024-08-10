import { Handlers, PageProps } from "$fresh/server.ts";
import { handler as loginHandler } from "../api/auth/login.ts";
import { AuthenticationError } from "../../Errors/AuthenticationError.ts";
import LoginForm from "../../islands/LoginForm.tsx";
import {
  makeAuthHeaders,
  validateAuthHeaders,
} from "../../lib/authentication.ts";
import Redirect from "../../islands/Redirect.tsx";
import { getUserByEmail } from "../../db/userSchema.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    let isAlreadyVerified: boolean | undefined;

    try {
      await validateAuthHeaders(req);
      isAlreadyVerified = true;
    } catch {
      isAlreadyVerified = false;
    }
    const resp = await ctx.render({ isAuthenticated: isAlreadyVerified });
    return resp;
  },
  async POST(req, ctx) {
    try {
      let isAlreadyVerified: boolean | undefined;

      try {
        await validateAuthHeaders(req);
        isAlreadyVerified = true;
      } catch {
        isAlreadyVerified = false;
      }

      const resp = await ctx.render({
        message: "success",
        isAuthenticated: true,
      });
      const headers = resp.headers;

      if (!isAlreadyVerified) {
        const login = await loginHandler.POST?.(req, ctx) as Response;

        const loginResp = await login.json();

        if (!login.ok) {
          throw new AuthenticationError(loginResp.email, loginResp.message);
        }

        const user = await getUserByEmail(loginResp.email);

        if (!user) {
          throw new Error(`No user: ${loginResp.email}`);
        }

        await makeAuthHeaders(req, headers, user.email, {
          updateRefreshToken: true,
          refreshTokenVersion: user.refreshTokenVersion || 1,
        });
      }

      return resp;
    } catch (err) {
      console.error(err);
      let email = "";
      if (err instanceof AuthenticationError) {
        email = err.email;
      }
      return ctx.render({
        message: "Bad credentials.",
        email,
        isAuthenticated: false,
      });
    }
  },
};

interface Props {
  message?: string;
  email?: string;
  isAuthenticated?: boolean;
}

export default function Home(props: PageProps<Props>) {
  const message = props.data?.message;
  const email = props.data?.email;
  const isAuthenticated = props.data?.isAuthenticated;

  return (
    <>
      <div class="grid place-items-center h-screen relative">
        {!isAuthenticated && <LoginForm email={email} message={message} />}
        {isAuthenticated && <Redirect to="/" timeout={0} />}
      </div>
    </>
  );
}
