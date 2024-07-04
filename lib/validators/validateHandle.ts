export const validateHandle = (handle: string) => {
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  return regex.test(handle);
};
