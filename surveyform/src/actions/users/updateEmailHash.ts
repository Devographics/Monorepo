import {
  User,
  // UserMongooseModel,
  UserTypeServer,
} from "~/lib/users/model.server";
import { UserDocument, UserType } from "~/lib/users/model";
import { createMutator, updateMutator } from "@vulcanjs/crud/server";
import { createEmailHash } from "~/account/email/api/encryptEmail";
import { getUsersCollection } from "@devographics/mongo";

/**
 * If a user doesn't yet have an updated emailHash2, generate it now
 * @param user
 * @param email
 * @returns
 */
export const updateUserEmailHash = async (user, email) => {
  const { _id, emailHash, emailHash2 } = user;
  if (!emailHash2) {
    const updatedEmailHash = createEmailHash(
      email,
      process.env.ENCRYPTION_KEY2
    );
    const Users = await getUsersCollection();

    // await UserMongooseModel.updateOne(
    //   { _id },
    //   {
    //     $set: {
    //       emailHash1: emailHash,
    //       emailHash2: updatedEmailHash,
    //     },
    //   }
    // );
    await Users.updateOne(
      { _id },
      {
        $set: {
          emailHash1: emailHash,
          emailHash2: updatedEmailHash,
        },
      }
    );
  }
};
