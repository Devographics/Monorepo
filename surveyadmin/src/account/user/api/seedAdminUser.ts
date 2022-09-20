import { createMutator } from "@vulcanjs/crud/server";
import { NewUserDocument } from "~/core/models/user";
import { User, UserMongooseModel } from "~/core/models/user.server";

/**
 * TODO: context is a kind of legacy parameter but createMutator
 * is not stricly dependent on graphql anymore, do we need the context?
 * @param context
 */
export const seedAdminUser = async (context: any) => {
  const count = await UserMongooseModel.count({ isAdmin: true });

  if (count === 0) {
    console.log("No admin user found, seeding admin");
    if (!process.env.ADMIN_EMAIL) {
      throw new Error(
        "ADMIN_EMAIL env variable not defined. Could not seed admin user"
      );
    }
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      throw new Error(
        "ADMIN_INITIAL_PASSWORD env variable not defined. Could not seed admin user."
      );
    }
    const admin: NewUserDocument = {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_INITIAL_PASSWORD,
      isAdmin: true,
    };
    try {
      await createMutator({
        model: User,
        data: admin,
        // context,
        asAdmin: true,
        validate: false,
      });
    } catch (error) {
      console.error("Could not seed admin user", error);
    }
  } else {
    console.log(`Found ${count} Admin(s) in the database, no need to seed.`);
  }
};
