import { AccessDeniedError } from "../../Errors/AccessDeniedError.ts";

export function accessDeniedErrorResponse(err: Error) {
  const error = new AccessDeniedError(err);
  return new Response(JSON.stringify({ message: error.message }), {
    status: 401,
  });
}
