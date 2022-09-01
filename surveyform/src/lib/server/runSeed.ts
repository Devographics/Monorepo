import mongoose from "mongoose";
import { debugMongo } from "~/lib/debuggers";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import seedDatabase from "~/lib/server/seed";
import { contextBase } from "~/lib/server/context";

async function runSeed() {
  // Seed in development
  // In production, we expect you to seed the database manually
  if (process.env.NODE_ENV !== "production") {
    console.info("Not in production, run seed script...");
    try {
      await connectToAppDb();
      debugMongo("Connected to db, seeding admin and restaurants");
      // TODO: what is the best pattern to seed in a serverless context?
      // We pass the default graphql context to the seed function,
      // so it can access our models
      await seedDatabase(contextBase);
      // also seed restaurant manually to demo a custom server
      const seedRestaurants = async () => {
        const db = mongoose.connection;
        const count = await db.collection("restaurants").countDocuments();
        if (count === 0) {
          await db.collection("restaurants").insertMany([
            {
              name: "The Restaurant at the End of the Universe",
            },
            { name: "The Last Supper" },
            { name: "Shoney's" },
            { name: "Big Bang Burger" },
            { name: "Fancy Eats" },
          ]);
        }
      };
      await seedRestaurants();
    } catch (err) {
      console.error(
        `\nCould not connect to Mongo database on URI during seed step.`
      );
      console.error(err);
      process.exit(1);
    }
  }
}

export default runSeed;
