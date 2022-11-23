
export const throwError = (...args) => {
  console.error(...args);
  throw new Error(JSON.stringify(args));
};
