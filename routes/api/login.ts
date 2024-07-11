import { Handlers } from "$fresh/server.ts";
import { AuthenticationError } from "../../Errors/AuthenticationError.ts";
import { authenticate, makeAuthHeaders } from "../../lib/authentication.ts";
import { signJwt } from "../../lib/jwt.ts";

export const handler: Handlers = {
    async POST(req, _ctx) {
        let email = "";
        let password = "";
        try {
            const isForm = req.headers.get("Content-Type")?.toLowerCase() ===
                "application/x-www-form-urlencoded";

            if (isForm) {
                const form = await req.formData();

                email = form.get("email")?.toString() as string;
                password = form.get("password")?.toString() as string;
            } else {
                const json = await req.json();
                email = json.email;
                password = json.password;
            }

            if (!email || !password) {
                throw new AuthenticationError(email);
            }

            const user = await authenticate(email, password);

            if (!user) {
                throw new AuthenticationError(email);
            }

            const token = await signJwt({ email });

            const headers = makeAuthHeaders(req, new Headers(), token);

            return new Response(JSON.stringify({ response: "ok", token }), {
                headers,
            });
        } catch (err) {
            console.log(err);
            return new Response(
                JSON.stringify({ message: err.message, email }),
                {
                    status: 401,
                },
            );
        }
    },
};
