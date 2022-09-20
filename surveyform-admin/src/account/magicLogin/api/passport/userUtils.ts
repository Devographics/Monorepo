import {
  User,
  UserMongooseModel,
  UserTypeServer,
} from "~/core/models/user.server";
import { UserType } from "~/core/models/user";
import { createMutator, updateMutator } from "@vulcanjs/crud/server";
import { createEmailHash } from "~/account/email/api/encryptEmail";

/**
 * If a valid anonymousId is provided, we add email to this anonymous user and upgrade it
 * Otherwise, we create a new user
 * @param param0
 * @returns
 */
export const createOrUpgradeUser = async ({
  anonymousId,
  email,
  meta,
  ...otherUserProps
}: {
  email: string;
  /** Upgrade an existing anonymous user to "passwordless" with email */
  anonymousId?: string;
} & Partial<UserType>) => {
  if (!anonymousId) {
    // 1.1) not anonymous, first login: create a user
    // create a new user in the db and return it

    // just to please ts
    const { authMode: otherAuthMode, meta: any, ...otherOtherUserProps } = otherUserProps;
    const user: UserTypeServer = {
      emailHash: createEmailHash(email),
      // TODO: the typings here are not very good, groups is optional during creation
      groups: [],
      // since we used a magic link the email is known to be valid already
      isVerified: true,
      authMode: "passwordless",
      meta,
      ...otherOtherUserProps, // can override other props, such as "isVerfied"
    };
    const createMutatorRes = await createMutator<UserTypeServer>({
      model: User,
      data: user,
      // context,
      asAdmin: true, // so we get all fields back
    });
    const createdUser = createMutatorRes.data;
    return createdUser;
  } else {
    // 1.2) already logged as anonymous, upgrade to passwordless with email
    const anonymousUser = (
      await UserMongooseModel.findById(anonymousId)
    )?.toObject();
    if (!anonymousUser) {
      throw new Error(
        `Got anonymousId ${anonymousId} but no user is matching in database. Cannot upgrade account`
      );
    }
    const upgradedUser: UserTypeServer = {
      ...(anonymousUser as UserTypeServer),
      emailHash: createEmailHash(email),
      isVerified: true,
      authMode: "passwordless",
    };
    const { data: updatedUser } = await updateMutator({
      model: User,
      data: upgradedUser,
      dataId: anonymousId,
      asAdmin: true,
    });
    return updatedUser;
  }
};

/**
 * If necessary, make the user verified and add an anonymousId
 * @param param0
 */
export const upgradeUser = async ({
  foundUser,
  anonymousId,
  makeVerified,
}: {
  foundUser: UserTypeServer;
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
    const updatedUser: UserType = {
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
    const { data: userAfterUpdate } = await updateMutator<UserTypeServer>({
      model: User,
      dataId: foundUser._id as string,
      data: updatedUser,
      asAdmin: true,
    });
    return userAfterUpdate;
  }
  return foundUser;
};

/**
 * Find user from their email, using the hash function
 * @param email
 * @returns
 */
export const findUserFromEmail = async (email: string) => {
  return await UserMongooseModel.findOne({ emailHash: createEmailHash(email) });
};
