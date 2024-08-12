import { Handlers } from "$fresh/server.ts";
import { SanitizedUser/*, updateUserByEmail*/ } from "../../../db/userSchema.ts";
// import { makeAuthHeaders } from "../../../lib/authentication.ts";
// import { handler as validateEmailHandler } from "../validate/email/index.ts";

export const handler: Handlers = {
    GET(_req, ctx) {
        const user = ctx.state.user as SanitizedUser;

        return new Response(JSON.stringify({ email: user.email }));
    },
    // TODO need to verify email also
    // async PUT(req, ctx) {
    //     const json = await req.json();
    //     ctx.state.email = json.email;

    //     const validation = await validateEmailHandler.POST?.(
    //         req,
    //         ctx,
    //     ) as Response;

    //     if (!validation.ok) return validation;

        // await updateUserByEmail((ctx.state.user as SanitizedUser).email, {
        //     email: ctx.state.email as string,
        // });

    //     return new Response(JSON.stringify({ email: ctx.state.email }));
    // },
};
