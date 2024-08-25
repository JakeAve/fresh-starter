import { FreshContext } from "$fresh/server.ts";
import { getUserByEmail, SanitizedUser, User } from "../../../db/userSchema.ts";
import { AccessDeniedError } from "../../../Errors/AccessDeniedError.ts";
import { accessDeniedErrorResponse } from "../../../lib/utils/accessDeniedErrorResponse.ts";
import { internalServerErrorResponse } from "../../../lib/utils/internalServerErrorResponse.ts";

export async function handler(
  _req: Request,
  ctx: FreshContext,
) {
  try {
    if (!ctx.state.isAuthenticated) {
      throw new AccessDeniedError(new Error("Is not authenticated"));
    }

    const email = ctx.state.email as string;

    const rawUser = await getUserByEmail(email) as Partial<User>;

    if (!rawUser) {
      throw new AccessDeniedError(new Error(`No user with email ${email}`));
    }

    ctx.state.rawUser = { ...rawUser };

    delete rawUser.id;
    delete rawUser.password;

    const user = { ...rawUser } as SanitizedUser;

    ctx.state.user = user;

    return ctx.next();
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return accessDeniedErrorResponse(err);
    }
    return internalServerErrorResponse(err);
  }
}
