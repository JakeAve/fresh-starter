import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { getUserByEmail } from "../../db/userSchema.ts";
import { randomTimeout } from "../../lib/utils/randomTimeout.ts";
import ForgotPasswordForm from "../../islands/ForgotPasswordForm.tsx";
import routes from "../../routes.ts";
import { addResetRequest } from "../../db/passwordResetSchema.ts";

export const handler: Handlers = {
    async GET(_req: Request, ctx: FreshContext) {
        const email = ctx.state.email;

        const resp = await ctx.render({ email });
        return resp;
    },
    async POST(req: Request, _ctx: FreshContext) {
        await randomTimeout(1000);
        const headers = new Headers();

        const form = await req.formData();
        const email = form.get("email")?.toString() as string;
        
        headers.set("location", routes["verify-password-reset"].index + `?email=${email || ""}`);
        const redirect = new Response(null, {
            status: 303,
            headers,
        });

        if (!email) {
            return redirect;
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return redirect;
        }
       
        await addResetRequest(user.id);

        return redirect;
    },
};

interface Props {
    message?: string;
    email?: string;
    isAuthenticated?: boolean;
}

export default function Home(props: PageProps<Props>) {
    const email = props.data?.email;

    return (
        <div class="grid place-items-center h-screen relative">
            <ForgotPasswordForm email={email} />
        </div>
    );
}
