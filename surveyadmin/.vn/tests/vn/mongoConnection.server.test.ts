/**
 * // @see https://jestjs.io/docs/en/next/configuration#testenvironment-string
 * @jest-environment node
 */
import {
  connectToDb,
  closeDbConnection,
  appDb,
  publicReadonlyDb,
} from "~/lib/server/mongoose/connection";
import mongoose from "mongoose";

if (!process.env.MONGO_URI)
  throw new Error("MONGO_URI env variable not defined");

const mongoUri = process.env.MONGO_URI;
describe("api/middlewares/mongoConnection", () => {
  afterEach(async () => {
    await closeDbConnection();
  });
  it("connects to mongo db", async () => {
    await connectToDb(mongoUri, "appDb").then(() => {
      expect(appDb.readyState).toEqual(1);
      //expect(publicReadonlyDb.readyState).toEqual(1);
    });
  });
  it("connects only once if already connecting", async () => {
    const promise = connectToDb(mongoUri, "appDb"); // you can define a .env.test to configure this
    const newPromise = connectToDb(mongoUri, "appDb"); // you can define a .env.test to configure this
    expect(promise).toEqual(newPromise);
  });
});
