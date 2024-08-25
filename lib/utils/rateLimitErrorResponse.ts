import { RateLimitError } from "../../Errors/RateLimitError.ts";

export function rateLimitErrorResponse(err: Error) {
  const error = new RateLimitError(err);
  return new Response(JSON.stringify({ message: error.message }), {
    status: 500,
  });
}
