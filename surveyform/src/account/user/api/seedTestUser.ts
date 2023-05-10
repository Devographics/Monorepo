import { getUsersCollection } from "@devographics/mongo";
import { createMutator } from "@vulcanjs/crud/server";
import { NewUserDocument } from "~/core/models/user";
import { User } from "~/core/models/user.server";

/**
 * Create at least one user
 * @param context
 */
export const seedTestUser = async () => {
  const Users = await getUsersCollection();
  const count = await Users.countDocuments({ isAdmin: true });
  // const count = await UserMongooseModel.count({ isAdmin: true });

  if (count === 0) {
    console.log("No admin user found, seeding admin");
    const testUser: NewUserDocument = {
      email: "test@devographics.com",
    };
    try {
      const resUser = await createMutator({
        model: User,
        data: testUser,
        // force a server-side run of the mutator
        asAdmin: true,
        validate: false,
      });
      console.log(
        `Seed a test user with email ${testUser.email} and _id ${resUser?.data?._id}`
      );
    } catch (error) {
      console.error("Could not seed test user", error);
    }
  } else {
    console.log(`Found ${count} User(s) in the database, no need to seed.`);
  }
};
