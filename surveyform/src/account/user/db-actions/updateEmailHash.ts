import { createEmailHash } from "~/account/email/api/encryptEmail";
import { getUsersCollection } from "@devographics/mongo";
import { EmailUser } from "../typings";

/**
 * If a user doesn't yet have an updated emailHash2, generate it now
 * TODO: move this function out of "account" and pass it as argument of the account system
 * @param user
 * @param email
 * @returns
 */
export const updateUserEmailHash = async (user: EmailUser, email: string) => {
  const { _id, emailHash, emailHash2 } = user;
  if (!emailHash2) {
    const updatedEmailHash = createEmailHash(
      email,
      process.env.ENCRYPTION_KEY2
    );
    const Users = await getUsersCollection();
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
