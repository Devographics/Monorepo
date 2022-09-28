import { seedTestUser } from "~/account/user/api/seedTestUser";

const seed = async (context) => {
  if (process.env.MONGO_URI?.match(/lbke-demo/)) {
    console.log("Using demo database, skip seeding");
    return;
  }

  // Run the seed functions
  await seedTestUser();
};

export default seed;
