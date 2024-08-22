import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { updateUserByEmail, User } from "../../db/userSchema.ts";
import PasswordPairInputs from "../../islands/PasswordPairInputs.tsx";
import { Button } from "$components/Button.tsx";
import routes from "../../routes.ts";
import Error404 from "../_404.tsx";
import { verifyOTC } from "../../db/passwordResetSchema.ts";
import { ValidationError } from "../../Errors/ValidationError.ts";
import { checkPasswordStrength } from "../../lib/passwordStrength.ts";
import { hashPassword } from "../../lib/cryptoHelpers.ts";
import { deleteCookie } from "$std/http/cookie.ts";
import { RESET_PASSWORD_COOKIE_NAME } from "../verify-password-reset/index.tsx";

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    const url = new URL(req.url);

    const email = url.searchParams.get("email") as string;

    const resp = await ctx.render({ email, error: ctx.state.error });
    return resp;
  },
  async POST(req: Request, ctx: FreshContext) {
    try {
      const rawUser = ctx.state.rawUser as User;
      const otc = ctx.state.otc as string;

      const form = await req.formData();
      const password = form.get("password") as string;
      const repeatPassword = form.get("repeat-password") as string;

      if (password !== repeatPassword) {
        throw new ValidationError(
          "New password and repeat password do not match",
        );
      }

      await checkPasswordStrength(password);

      const hashedPassword = await hashPassword(password);

      await updateUserByEmail(rawUser.email, {
        password: hashedPassword,
        isEmailVerified: true, // just in case the email was never validated
      });

      await verifyOTC(rawUser.id, otc, { willInvalidateOTC: true });

      const headers = new Headers();

      headers.set("location", routes.login.index);

      const url = new URL(req.url);

      deleteCookie(headers, RESET_PASSWORD_COOKIE_NAME, {
        path: "/",
        domain: url.hostname,
      });

      const redirect = new Response(null, {
        status: 303,
        headers,
      });

      return redirect;
    } catch (err) {
      console.error(err);
      if (err instanceof ValidationError) {
        return ctx.render({ message: err.message });
      }
      return ctx.render({ message: "Unknown error" });
    }
  },
};

interface Props {
  error?: boolean;
  message?: string;
}

export default function Home(props: PageProps<Props>) {
  const error = props.data?.error;
  const message = props.data?.message;

  if (error) {
    return <Error404 />;
  }
  return (
    <div class="grid place-items-center h-screen">
      <div class="shadow-md rounded px-8 py-6">
        <p>
          Enter and confirm a new password. You will be redirected to login with
          your new password. If you fail to reset your password in a few
          minutes, you will need to request a new reset code.
        </p>
        <form class="flex flex-col" method="post">
          <PasswordPairInputs />
          <Button>Reset Password</Button>
          {message && <p class="text-red-500 mt-2 text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
}
