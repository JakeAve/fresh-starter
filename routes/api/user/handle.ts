import { FreshContext, Handlers } from "$fresh/server.ts";
import {
    getUserByHandle,
    SanitizedUser,
    updateUserByEmail,
} from "../../../db/userSchema.ts";
import { ConflictError } from "../../../Errors/ConflictError.ts";
import { validateHandle } from "../../../lib/validators/validateHandle.ts";

export const handler: Handlers = {
    GET(_req, ctx) {
        const user = ctx.state.user as SanitizedUser;

        return new Response(JSON.stringify({ handle: user.handle }));
    },
    async PUT(req: Request, ctx: FreshContext) {
        try {
            const json = await req.json();
            const { handle } = json;

            validateHandle(handle);

            const existingUser = await getUserByHandle(handle);
            if (existingUser) {
                throw new ConflictError(`@${handle} is already taken.`);
            }

            const currentUser = ctx.state.user as SanitizedUser;

            await updateUserByEmail(currentUser.email, { handle });

            return new Response(
                JSON.stringify({
                    response: "ok",
                    handle,
                    message: `Updated to @${handle}`,
                }),
            );
        } catch (err) {
            return new Response(JSON.stringify({ message: err.message }), {
                status: err instanceof ConflictError ? 409 : 400,
            });
        }
    },
};
