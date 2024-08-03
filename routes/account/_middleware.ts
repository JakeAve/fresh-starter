import { FreshContext } from "$fresh/server.ts";
import { getUserByEmail, SanitizedUser, User } from "../../db/userSchema.ts";
import { makeAuthHeaders } from "../../lib/authentication.ts";
import { validateAuthHeaders } from "../../lib/authentication.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  try {
    const { sub: email } = await validateAuthHeaders(req);

    const rawUser = await getUserByEmail(email) as Partial<User>;

    ctx.state.rawUser = { ...rawUser };

    delete rawUser.id;
    delete rawUser.password;

    const user = { ...rawUser } as SanitizedUser;

    ctx.state.user = user;

    const resp = await ctx.next();
    
    await makeAuthHeaders(req, resp.headers, email);

    return resp;
  } catch (err) {
    console.error(err);
    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  }
}
