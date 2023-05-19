import { getUsersCollection } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";
import { createUser } from "~/lib/users/db-actions/create";

/**
 * Create at least one user
 * @param context
 */
export const seedTestUser = async () => {
  const Users = await getUsersCollection();
  const count = await Users.countDocuments();

  if (count === 0) {
    console.log("No user found, seeding admin");
    const data: UserDocument = {
      email: "test@devographics.com",
    };
    try {
      const testUser = await createUser({ data });
      console.log(
        `Seed a test user with email ${testUser?.email} and _id ${testUser?._id}`
      );
    } catch (error) {
      console.error("Could not seed test user", error);
    }
  } else {
    console.log(`Found ${count} User(s) in the database, no need to seed.`);
  }
};
