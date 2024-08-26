import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { getUserByEmail } from "../../db/userSchema.ts";
import { randomTimeout } from "../../lib/utils/randomTimeout.ts";
import VerifyPasswordResetForm from "../../islands/VerifyPasswordResetCodeForm.tsx";
import routes from "../../routes.ts";
import { PasswordResetError, verifyOTP } from "../../db/passwordResetSchema.ts";
import { internalServerErrorResponse } from "../../lib/utils/internalServerErrorResponse.ts";
import { setCookie } from "$std/http/cookie.ts";
import { load } from "$std/dotenv/mod.ts";

export const RESET_PASSWORD_COOKIE_NAME = "reset-password";

const env = await load();

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const url = new URL(req.url);

    const email = url.searchParams.get("email") as string;

    const resp = await ctx.render({ email });
    return resp;
  },
  async POST(req: Request, ctx: FreshContext) {
    try {
      await randomTimeout(1000);

      const url = new URL(req.url);
      const email = url.searchParams.get("email");

      if (!email) {
        throw new PasswordResetError("No user email specified");
      }

      const form = await req.formData();
      const resetCode = form.get("reset-code")?.toString() as string;

      if (!resetCode || resetCode.length !== 6) {
        throw new PasswordResetError("Could not verify OTP");
      }

      const user = await getUserByEmail(email);
      if (!user) {
        throw new Error("No user");
      }

      const headers = new Headers();
      headers.set(
        "location",
        routes["reset-password"].index + `?email=${email}`,
      );

      const resetRequest = await verifyOTP(user.id, resetCode);

      setCookie(headers, {
        name: RESET_PASSWORD_COOKIE_NAME,
        value: resetRequest.otc as string,
        maxAge: 900,
        domain: url.hostname,
        path: "/",
        secure: env.APP_ENVIRONMENT === "production" ? true : false,
      });

      const redirect = new Response(null, {
        status: 303,
        headers,
      });

      return redirect;
    } catch (err) {
      if (err instanceof PasswordResetError) {
        return ctx.render({ message: err.message });
      }
      return internalServerErrorResponse(err);
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
    <div class="grid place-items-center min-h-screen relative">
      <div>
        <p>{message}</p>
        <VerifyPasswordResetForm email={email} />
      </div>
    </div>
  );
}
