import { UserDocument } from "~/account/user/typings";
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
  let newHashUser, legacyHashUser;
  const emailHash = createEmailHash(email);
  // start by looking for a user matching the new (secure) hash
  newHashUser = await Users.findOne(
    {
      emailHash,
    },
    { sort: { createdAt: -1 } }
  );

  // if we didn't find user matching email using regular hash, also
  // try with legacy (weaker) hash
  if (!newHashUser) {
    const emailHashLegacy = createEmailHash(
      email,
      process.env.ENCRYPTION_KEY_LEGACY
    );
    legacyHashUser = await Users.findOne(
      {
        emailHash: emailHashLegacy,
      },
      { sort: { createdAt: -1 } }
    );

    // if we did find a user, update it to the regular hash so that
    // we can skip this step next time
    if (legacyHashUser) {
      await Users.updateOne(
        { _id: legacyHashUser._id },
        {
          $set: {
            emailHash,
            emailHashLegacy, // save legacy hash for safekeeping
          },
        }
      );
    }
  }
  const user = newHashUser || legacyHashUser;
  return user as UserDocument;
};
