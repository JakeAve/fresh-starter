import { ValidationError } from "../Errors/ValidationError.ts";

export const hasLowercase = (str: string) => /[a-z]/.test(str);
export const hasUppercase = (str: string) => /[A-Z]/.test(str);
export const hasNumber = (str: string) => /\d/.test(str);
export const hasSpecialChar = (str: string) => /[^A-Za-z0-9]/.test(str);
export const minLength = (len: number) => (str: string) => str.length >= len;

export interface PasswordStrength {
  hasMinLength?: boolean;
  hasLowercase?: boolean;
  hasUppercase?: boolean;
  hasNumber?: boolean;
  hasSpecialChar?: boolean;
  isPreviousPassword?: boolean;
}

export class WeakPasswordError extends ValidationError {
  name: string;
  willThrow: boolean;
  #failedAttrs: string[] = [];
  responseBody: PasswordStrength;

  constructor(message = "Weak Password", name = "WeakPasswordError") {
    super(message);
    this.name = name;
    this.willThrow = false;
    this.responseBody = {};
  }

  add(message: string) {
    this.willThrow = true;
    this.#failedAttrs.push(message);
    this.message = this.#failedAttrs.join(", ");
  }
}

export async function checkPasswordStrength(
  newPassword: string,
  _previousPasswords: string[] = [],
  validations = [
    {
      message: "password much have at least one lowercase letter",
      name: "hasLowercase" as keyof PasswordStrength,
      required: true,
      callback: hasLowercase,
    },
    {
      message: "password much have at least one uppercase letter",
      name: "hasUppercase" as keyof PasswordStrength,
      required: false,
      callback: hasUppercase,
    },
    {
      message: "password much have at least one number",
      name: "hasNumber" as keyof PasswordStrength,
      required: false,
      callback: hasNumber,
    },
    {
      message:
        "password much have at least one special character (!@#$%^&*()_+{}|:<>?)",
      name: "hasSpecialChar" as keyof PasswordStrength,
      required: false,
      callback: hasSpecialChar,
    },
    {
      message: "password must be at least 8 characters",
      name: "hasMinLength" as keyof PasswordStrength,
      required: true,
      callback: minLength(8),
    },
    // {name: 'cannot be old password', required: true, callback: () => oldPasswords.includes(newPassword) }
  ],
) {
  const weakError = new WeakPasswordError();
  const passwordStrength: PasswordStrength = {};

  for (const { message, name, required, callback } of validations) {
    const result = await callback(newPassword);
    passwordStrength[name] = result;

    if (required && !result) {
      weakError.add(message);
      weakError.responseBody = passwordStrength;
    }
  }

  if (weakError.willThrow) {
    throw weakError;
  }

  return passwordStrength;
}
