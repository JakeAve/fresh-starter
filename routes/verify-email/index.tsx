import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import {
  getUserByEmail,
  getUserById,
  updateUserByEmail,
} from "../../db/userSchema.ts";
import {
  addEmailVerification,
  EmailVerificationError,
  getEmailVerification,
  verifyEmail,
} from "../../db/verifyEmailSchema.ts";
import { sendVerifyEmail } from "../../email/client.ts";
import { AccessDeniedError } from "../../Errors/AccessDeniedError.ts";
import { accessDeniedErrorResponse } from "../../lib/utils/accessDeniedErrorResponse.ts";
import { internalServerErrorResponse } from "../../lib/utils/internalServerErrorResponse.ts";
import routes from "../../routes.ts";
import Error500 from "../_500.tsx";

export const RESET_PASSWORD_COOKIE_NAME = "reset-password";

export const handler: Handlers = {
  async GET(req: Request, ctx: FreshContext) {
    let message = "";
    let fatalError = false;
    let email = "";
    try {
      const url = new URL(req.url);

      email = url.searchParams.get("email") as string;
      const otc = url.searchParams.get("otc") as string;

      if (!email || !otc) {
        fatalError = true;
        throw new Error("No email or no otc");
      }

      const emailVerification = await verifyEmail(email, otc);

      const user = await getUserById(emailVerification.userId);

      if (!user) {
        message =
          `The email address ${email} is no longer associated with that account`;
        throw new Error("No user");
      }

      try {
        await updateUserByEmail(user.email, { isEmailVerified: true });
      } catch {
        fatalError = true;
      }

      message = `The email address ${email} has been successfully verified.`;
    } catch (err) {
      console.error(err);
      if (err instanceof EmailVerificationError) {
        message = "The link provided is invalid.";
      }
    }

    return ctx.render({ email, fatalError, message });
  },
  async POST(req: Request, ctx: FreshContext) {
    try {
      if (!ctx.state.isAuthenticated || !ctx.state.email) {
        throw new AccessDeniedError(new Error("Not authenticated or no email"));
      }

      const email = ctx.state.email as string;

      const rawUser = await getUserByEmail(email);

      if (!rawUser) {
        throw new AccessDeniedError(new Error(`Could not find user ${email}`));
      }

      if (rawUser.isEmailVerified) {
        return new Response(
          JSON.stringify({
            message: `Already verified ${ctx.state.email}`,
          }),
          { status: 403 },
        );
      }

      const existingVerification = await getEmailVerification(email);

      if (existingVerification) {
        return new Response(
          JSON.stringify({
            message:
              `Already sent authorization code to email ${ctx.state.email}`,
          }),
          { status: 409 },
        );
      }

      const verification = await addEmailVerification({
        userEmail: rawUser.email,
        userId: rawUser.id,
      });

      const url = new URL(req.url);

      const link = `${url.protocol}//${url.host}${
        routes["verify-email"].index
      }?email=${rawUser.email}&otc=${verification.otc}`;

      await sendVerifyEmail(verification.userEmail, {
        YEAR: new Date().getFullYear().toString(),
        COMPANY: "Company",
        USER: rawUser.name,
        LINK: link,
      });

      return new Response(
        JSON.stringify({
          response: "ok",
          message: `Email request sent to ${email}`,
        }),
      );
    } catch (err) {
      if (err instanceof AccessDeniedError) {
        return accessDeniedErrorResponse(err);
      }
      return internalServerErrorResponse(err);
    }
  },
};

interface Props {
  email: string;
  fatalError: boolean;
  message: string;
}

export default function Home(props: PageProps<Props>) {
  const { fatalError, message } = props.data;
  if (fatalError) {
    return <Error500 />;
  }
  return (
    <div class="grid place-items-center min-h-screen relative">
      <div>
        <h1 class="text-center text-xl">Email Verification</h1>
        <p class="text-center text-lg">{message}</p>
      </div>
    </div>
  );
}
