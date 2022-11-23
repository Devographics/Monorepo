import pickBy from "lodash/pickBy.js";

const excludePrefixes = ["npm_", "rvm_"];

const startsWith = (s, prefix) => s.substring(0, prefix.length) === prefix;

const startsWithAnyOf = (s, prefixes) =>
  prefixes.some((prefix) => startsWith(s, prefix));

export const logOutEnv = async () => {
  console.log(`// Current process.env (${excludePrefixes.join()} excluded):`);
  const env = pickBy(
    process.env,
    (value, key) => !startsWithAnyOf(key, excludePrefixes)
  );
  console.log(env);
  return env;
};

logOutEnv.description = `Get a log of the current .env variables.`;
