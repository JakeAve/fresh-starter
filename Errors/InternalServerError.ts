export class InternalServerError extends Error {
  constructor(error: Error, message = "Internal server error") {
    console.error(error);
    super(message);
  }
}
