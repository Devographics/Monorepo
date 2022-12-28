/**
 * This script will be run outside of Next.js environment
 */
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createIndexes } from "./serverStart/createIndexes";
import { onStartup } from "./serverStart/startup";
import runSeed from "~/lib/server/runSeed";

// Top level await will be available in Node 17
async function run() {
  // 1. Load env config
  await loadEnvConfig(process.env.PWD!, process.env.NODE_ENV === "development");
  console.info(
    "Loaded env variables, NEXT_PUBLIC_NODE_ENV",
    process.env.NEXT_PUBLIC_NODE_ENV
  );

  // 2. Run relevant scripts
  await createIndexes();
  await onStartup();

  // 3. In dev, run seed
  await runSeed();
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
