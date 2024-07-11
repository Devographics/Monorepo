import { getAppClient, getAppDb } from "@devographics/mongo";
import env from "@next/env";
const { loadEnvConfig } = env;

async function run() {
  loadEnvConfig(
    process.env.PWD!,
    // will load either from .env.development or .env.production
    process.env.NODE_ENV === "development"
  );
  const db = await getAppDb();
  if (!process.env.MONGO_PRIVATE_URI?.match(/localhost/)) {
    throw new Error(
      "Cannot reset non local database!! Uri was: " +
        process.env.MONGO_PRIVATE_URI
    );
  }
  await db.dropDatabase();
  const client = await getAppClient();
  client.close();
}
run();
