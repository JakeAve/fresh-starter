import { setCookie } from "$std/http/cookie.ts";
import { AuthenticationError } from "../Errors/AuthenticationError.ts";
import { getUserByEmail } from "../db/userSchema.ts";
import { verifyPassword } from "./cryptoHelpers.ts";

export async function authenticate(email: string, password: string) {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw new AuthenticationError(email);
        }

        await verifyPassword(password, user.password);

        return user;
    } catch (err) {
        console.log(err);
        throw new AuthenticationError(email);
    }
}

export function makeAuthHeaders(
    req: Request,
    headers: Headers,
    token: string,
) {
    const url = new URL(req.url);
    setCookie(headers, {
        name: "user-token",
        value: token,
        maxAge: 3600,
        domain: url.hostname,
        path: "/",
        secure: true,
    });

    return headers;
}
