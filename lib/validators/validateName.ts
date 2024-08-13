import { ValidationError } from "../../Errors/ValidationError.ts";

export const validateName = (name: string) => {
  if (name.length < 1) {
    throw new ValidationError("Name must have at least 1 character");
  }
  if (name.length > 50) {
    throw new ValidationError("Name must be no longer than 50 characters");
  }
  const regex = /[\<\>\\\#\$\/\*]/;
  const isValid = !regex.test(name);
  if (!isValid) {
    throw new ValidationError(
      "Name doesn't allow certain special characters",
    );
  }
  return isValid;
};
