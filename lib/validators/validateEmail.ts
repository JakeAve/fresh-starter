import { ValidationError } from "../../Errors/ValidationError.ts";

export const validateEmail = (email: string) => {
  if (email.length === 0) {
    throw new ValidationError("Email cannot be blank");
  }
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  const isValid = regex.test(email);
  if (!isValid) {
    throw new ValidationError(`Invalid email: ${email}`);
  }
  return isValid;
};
