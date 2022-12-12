import { debugMongo } from "~/lib/debuggers";
import mongoose, { Connection, ConnectOptions } from "mongoose";
import { serverConfig } from "~/config/server";

// Do not pass a URL yet, to avoid triggering the connection

/**
 * Main database as a Mongoose connection
 * 
 * appDb.db gives access to the MongoDb object
 */
export const appDb = mongoose.createConnection()
/**
 * Read-only db for normalized results
 * /!\ Treat as if it was public
 */
export const publicReadonlyDb = mongoose.createConnection()
const connections = { appDb, publicReadonlyDb }

/**
 * Connect to any mongo database
 *
 * NOTE: do not use directly, prefer using "connectToAppDb"
 * 
 * @see https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-createConnection
 */
export const connectToDb = async (
  mongoUri: string,
  connectionKey: keyof typeof connections,
  options?: ConnectOptions
) => {
  const connection = connections[connectionKey]
  if (![1, 2].includes(connection.readyState)) {
    debugMongo("Call mongoose connect");
    connection.openUri(mongoUri, options || {})
    // Wait for connection
  } else {
    debugMongo("Already connecting mongoose...")
  }
  await connection.asPromise()
};

export const isLocalMongoUri = () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri)
    throw new Error(
      "MONGO_URI env variable not defined. Is your .env file correctly loaded?"
    );
  const isLocal = mongoUri.match(/localhost/);
  return isLocal;
};

/**
 * Connect to application main database and public read-only database for normalized responses
 * 
 */
export const connectToAppDb = async () => {
  const mongoUri = serverConfig.mongoUri
  if (!mongoUri) throw new Error("MONGO_URI env variable is not defined");
  const mongoUriPublic = serverConfig.publicReadonlyMongoUri;
  if (!mongoUriPublic) throw new Error("MONGO_URI_PUBLIC_READONLY env variable is not defined");
  const isLocalMongo = mongoUri.match(/localhost/);
  try {
    await Promise.all([
      connectToDb(mongoUri, "appDb", {}),
      connectToDb(mongoUriPublic, "publicReadonlyDb", {})
    ]);
  } catch (err) {
    console.error(`\nCould not connect to Mongo database on URI ${mongoUri} and/or ${mongoUriPublic}.`);
    if (isLocalMongo) {
      console.error("Did you forget to run 'yarn run start:mongo'?\n");
    }
    console.error(err);
    // rethrow
    throw err;
  }
};



export async function closeDbConnection() {
  try {
    await Promise.all([
      appDb.close(),
      publicReadonlyDb.close()
    ])
  } catch (err) {
    // Catch locally error
    console.error("Could not close mongoose connection");
    console.error(err);
    throw err;
  }
}
