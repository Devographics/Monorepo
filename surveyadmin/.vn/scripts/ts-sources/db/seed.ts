import {
  closeDbConnection,
  connectToAppDb,
} from "~/lib/server/mongoose/connection";
import runSeed from "~/lib/server/runSeed";

// No top-level async for Node 14
async function run() {
  await connectToAppDb();
  await runSeed();
  await closeDbConnection();
}
run();
