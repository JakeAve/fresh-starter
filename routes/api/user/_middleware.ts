import { FreshContext } from "$fresh/server.ts";
import { getUserByEmail, SanitizedUser, User } from "../../../db/userSchema.ts";

export async function handler(
  _req: Request,
  ctx: FreshContext,
) {
  try {
    if (!ctx.state.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    const email = ctx.state.email as string;

    const rawUser = await getUserByEmail(email) as Partial<User>;

    ctx.state.rawUser = { ...rawUser };

    delete rawUser.id;
    delete rawUser.password;

    const user = { ...rawUser } as SanitizedUser;

    ctx.state.user = user;

    return ctx.next();
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Access Denied." }),
      { status: 401 },
    );
  }
}
