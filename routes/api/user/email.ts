import { Handlers } from "$fresh/server.ts";
import { SanitizedUser, updateUserByEmail } from "../../../db/userSchema.ts";
import { addEmailVerification } from "../../../db/verifyEmailSchema.ts";
import { sendVerifyEmail } from "../../../email/client.ts";
import { makeAuthHeaders } from "../../../lib/authentication.ts";
import routes from "../../../routes.ts";
import { handler as validateEmailHandler } from "../validate/email/index.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    const user = ctx.state.user as SanitizedUser;

    return new Response(JSON.stringify({ email: user.email }));
  },
  async PUT(req, ctx) {
    const json = await req.json();

    ctx.state.updatedEmail = json.email;
    
    const newEmail = json.email as string;

    const user = ctx.state.user as SanitizedUser;

    if (
      user.emailLastUpdated &&
      new Date().getTime() - user.emailLastUpdated.getTime() <
        1000 * 60 * 60 * 24 * 90
    ) {
      return new Response(
        JSON.stringify({
          message: "Cannot update email more than once every 90 days",
        }),
        { status: 400 },
      );
    }

    const validation = await validateEmailHandler.POST?.(
      req,
      ctx,
    ) as Response;

    if (!validation.ok) return validation;

    const updatedUser = await updateUserByEmail(
      user.email,
      {
        email: newEmail,
        isEmailVerified: false,
      },
    );

    const { headers } = await makeAuthHeaders(
      req,
      new Headers(),
      newEmail,
      {
        updateRefreshToken: true,
        refreshTokenVersion:
          (ctx.state.user as SanitizedUser).refreshTokenVersion + 1,
      },
    );

    ctx.state.email = updatedUser.email;

    const verification = await addEmailVerification({
      userEmail: newEmail,
      userId: updatedUser.id,
    });

    const url = new URL(req.url);

    const link = `${url.protocol}//${url.host}${
      routes["verify-email"].index
    }?email=${newEmail}&otc=${verification.otc}`;

    await sendVerifyEmail(newEmail, {
      USER: updatedUser.name,
      YEAR: new Date().getFullYear().toString(),
      COMPANY: "Company",
      LINK: link,
    });

    return new Response(JSON.stringify({ email: newEmail }), {
      headers,
    });
  },
};
