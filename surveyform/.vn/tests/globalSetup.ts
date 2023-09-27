import { loadEnvConfig } from "@next/env"

module.exports = async () => {
  console.info('Jest setupTests script will:');
  console.info("Loading environment variables in Jest from .env files");
  if (!process.env.PWD) throw new Error("PWD env variable not defined, are you using Linux?")
  // @see https://github.com/vercel/next.js/issues/17903#issuecomment-708902413
  loadEnvConfig(process.env.PWD);
};
