import { UserDocument } from "~/account/user/typings";
import { getUsersCollection } from "@devographics/mongo";

/**
 * If necessary, make the user verified and add an anonymousId
 * TODO: not very clear when to call this function
 * @param param0
 */
export const upgradeUser = async ({
  foundUser,
  anonymousId,
  makeVerified,
}: {
  foundUser: UserDocument;
  anonymousId?: string;
  // Set to true if the user must be verified
  makeVerified: boolean;
}) => {
  /**
   * Happens if we let the user authenticate after sending the magic link but before
   * they click on it, in order to reduce friction on first login
   */
  const mustVerify = makeVerified && !foundUser.isVerified;
  const mustAddAnonymousId =
    /**
     * Happens when the user logs as anonymous, and then provide an email,
     * but already had an account
     * For instance if every year they log as anonymous first, but then change their mind
     * and enter the same email we already know
     */
    anonymousId && !(foundUser.anonymousIds || []).includes(anonymousId);

  const mustChangeAuthMode = foundUser.authMode !== "passwordless";

  // 2.1) already logged in with email, we retrieve the user from the db
  const needUpdate = mustVerify || mustAddAnonymousId || mustChangeAuthMode;

  // 2.2) in order to avoid losing data, we must remember the temporary anonymousId
  // TODO: we should also trigger a script that will replace the "anonymousId" by "foundUser._id"
  // in all documents with a userId (eg responses)
  if (needUpdate) {
    const updatedUser: UserDocument = {
      ...foundUser,
    };
    if (mustVerify) {
      updatedUser.isVerified = true;
    }
    if (mustAddAnonymousId) {
      updatedUser.anonymousIds = [
        ...(foundUser.anonymousIds || []),
        anonymousId,
      ];
    }
    if (mustChangeAuthMode) {
      updatedUser.authMode = "passwordless";
    }

    const Users = await getUsersCollection()
    await Users.updateOne({ _id: foundUser._id }, {
      $set: {
        ...updatedUser
      }
    })
    const userAfterUpdate = await Users.findOne({ _id: foundUser._id })
    return userAfterUpdate;
  }
  return foundUser;
};
