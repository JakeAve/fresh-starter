import { InternalServerError } from "../../Errors/InternalServerError.ts";

export function internalServerErrorResponse(err: Error) {
    const error = new InternalServerError(err);
    return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
    });
}
