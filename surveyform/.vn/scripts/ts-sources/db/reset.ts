import env from "@next/env";
const { loadEnvConfig } = env;
// import mongoose from "mongoose";
// import {
//   closeDbConnection,
//   connectToAppDb,
// } from "~/lib/server/mongoose/connection";

async function run() {
  loadEnvConfig(
    process.env.PWD!,
    // will load either from .env.development or .env.production
    process.env.NODE_ENV === "development"
  );
  // await connectToAppDb();
  // await mongoose.connection.db.dropDatabase();
  // await closeDbConnection();
}
run();
