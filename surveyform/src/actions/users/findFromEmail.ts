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
 * Find user from their email, using the hash function
 * @param email
 * @returns
 */
// note: in case there are more than one users with the same emailHash,
// always use the most recent one
export const findUserFromEmail = async (email: string) => {
  const Users = await getUsersCollection<UserDocument>();
  const usersByEmail = await Users.find(
    {
      emailHash: createEmailHash(email),
    },
    { sort: { createdAt: -1 }, limit: 1 }
  ).toArray();
  return usersByEmail[0];
};
