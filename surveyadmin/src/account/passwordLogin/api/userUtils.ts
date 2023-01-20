import { createEmailHash } from "~/account/email/api/encryptEmail";
import { UserMongooseModel } from "~/core/models/user.server";

/**
 * Find user from their email, using the hash function
 * @param email
 * @returns
 */
export const findUserFromEmail = async (email: string) => {
  return await UserMongooseModel.findOne({ emailHash: createEmailHash(email) });
};