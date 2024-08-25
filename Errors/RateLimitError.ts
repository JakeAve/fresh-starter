export class RateLimitError extends Error {
  constructor(error: Error, message = "Rate limit exceeded") {
    console.error(error);
    super(message);
  }
}
