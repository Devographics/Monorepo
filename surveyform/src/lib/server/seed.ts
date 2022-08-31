import { seedAdminUser } from "~/account/user/api/seedAdminUser";

const seed = async (context) => {
  if (process.env.MONGO_URI?.match(/lbke-demo/)) {
    console.log("Using demo database, skip seeding");
    return;
  }

  // Run the seed functions
  await seedAdminUser(context);
};

export default seed;
