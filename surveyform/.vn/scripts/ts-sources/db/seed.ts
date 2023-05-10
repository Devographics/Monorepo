import { getAppClient } from "@devographics/mongo";
import env from "@next/env";
const { loadEnvConfig } = env;
import runSeed from "~/lib/server/runSeed";

// No top-level async for Node 14
async function run() {
  loadEnvConfig(
    process.env.PWD!,
    // will load either from .env.development or .env.production
    process.env.NODE_ENV === "development"
  );
  await runSeed();
  (await getAppClient()).close()
}
run();
