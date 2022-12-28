import mongoose from "mongoose";
import {
  appDb,
  closeDbConnection,
  connectToAppDb,
  publicReadonlyDb,
} from "~/lib/server/mongoose/connection";

async function run() {
  await connectToAppDb();
  await publicReadonlyDb.db.dropDatabase();
  await appDb.db.dropDatabase();
  await closeDbConnection();
}
run();
