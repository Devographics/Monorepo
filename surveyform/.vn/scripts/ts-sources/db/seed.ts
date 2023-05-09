import env from "@next/env";
const { loadEnvConfig } = env;
// import {
//   closeDbConnection,
//   connectToAppDb,
// } from "~/lib/server/mongoose/connection";
import runSeed from "~/lib/server/runSeed";

// No top-level async for Node 14
async function run() {
  loadEnvConfig(
    process.env.PWD!,
    // will load either from .env.development or .env.production
    process.env.NODE_ENV === "development"
  );
  // await connectToAppDb();
  await runSeed();
  // await closeDbConnection();
}
run();
