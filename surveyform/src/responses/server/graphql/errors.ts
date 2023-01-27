
export const throwError = (...args): never => {
  console.error(...args);
  throw new Error(JSON.stringify(args));
};
