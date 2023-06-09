import { getUsersCollection } from "@devographics/mongo";
import { createEmailHash } from "~/account/email/api/encryptEmail";

/**
 * Find user from their email, using the hash function
 * @param email
 * @returns
 */
export const findUserFromEmail = async (email: string) => {
  const Users = await getUsersCollection()
  return await Users.findOne({ emailHash: createEmailHash(email) });
};