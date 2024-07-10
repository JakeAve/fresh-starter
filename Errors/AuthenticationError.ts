export class AuthenticationError extends Error {
  email: string;
  constructor(email: string, message = "Could not login.") {
    super(message);
    this.email = email;
  }
}
