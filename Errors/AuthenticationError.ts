export class AuthenticationError extends Error {
    constructor(message = "Could not login.") {
      super(message);
    }
  }
  