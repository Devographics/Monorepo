import { getUsersCollection, newMongoId } from "@devographics/mongo";
import { UserDocument } from "~/core/models/user";

/**
 * Create at least one user
 * @param context
 */
export const seedTestUser = async () => {
  const Users = await getUsersCollection();
  const count = await Users.countDocuments();

  if (count === 0) {
    console.log("No user found, seeding admin");
    const testUser: UserDocument = {
      _id: newMongoId(),
      email: "test@devographics.com",
    };
    try {
      await Users.insertOne(testUser)
      console.log(
        `Seed a test user with email ${testUser.email} and _id ${testUser._id}`
      );
    } catch (error) {
      console.error("Could not seed test user", error);
    }
  } else {
    console.log(`Found ${count} User(s) in the database, no need to seed.`);
  }
};
