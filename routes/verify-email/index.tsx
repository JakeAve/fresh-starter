import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import { getUserById, updateUserByEmail } from "../../db/userSchema.ts";
import {
    EmailVerificationError,
    verifyEmail,
} from "../../db/verifyEmailSchema.ts";
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

            message =
                `The email address ${email} has been successfully verified.`;
        } catch (err) {
            console.error(err);
            if (err instanceof EmailVerificationError) {
                message = "The link provided is invalid.";
            }
        }

        return ctx.render({ email, fatalError, message });
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
        <div class="grid place-items-center h-screen relative">
            <div>
                <h1 class="text-center text-xl">Email Verification</h1>
                <p class="text-center text-lg">{message}</p>
            </div>
        </div>
    );
}
