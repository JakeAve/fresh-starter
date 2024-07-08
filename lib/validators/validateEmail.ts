export const validateEmail = (email: string) => {
  if (email.length === 0) {
    throw new Error("Email cannot be blank");
  }
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  const isValid = regex.test(email);
  if (!isValid) {
    throw new Error(`Invalid email: ${email}`);
  }
  return isValid;
};
