import { seedTestUser } from "~/account/user/api/seedTestUser";

const seed = async (context) => {
  // Run the seed functions
  await seedTestUser();
};

export default seed;
