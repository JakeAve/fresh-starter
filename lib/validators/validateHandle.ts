export const validateHandle = (handle: string) => {
  if (handle.length < 3) {
    throw new Error("Handle must have at least 3 characters");
  }
  if (handle.length > 30) {
    throw new Error("Handle must be no longer than 30 characters");
  }
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  const isValid = regex.test(handle);
  if (!isValid) {
    throw new Error(
      "Handle can only contain lowercase letters, numbers and underscores (_)",
    );
  }
  return isValid;
};
