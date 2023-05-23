import { UserDocument } from "~/account/user/typings";
import { createEmailHash } from "~/account/email/api/encryptEmail";
import { getUsersCollection, newMongoId } from "@devographics/mongo";
import { createUser } from "~/lib/users/db-actions/create";
import { loadUser } from "~/lib/users/db-actions/load";

async function createPasswordlessUser({
  email,
  ...otherUserProps
}: { email: string } & Partial<UserDocument>) {
  // 1.1) not anonymous, first login: create a user
  // create a new user in the db and return it

  // just to please ts
  const { authMode: otherAuthMode, ...otherOtherUserProps } = otherUserProps;
  const user: UserDocument = {
    _id: newMongoId(),
    emailHash: createEmailHash(email),
    // since we used a magic link the email is known to be valid already
    isVerified: true,
    authMode: "passwordless",
    ...otherOtherUserProps, // can override other props, such as "isVerfied"
  };
  const createdUser = await createUser({ data: user });
  return createdUser;
}

async function upgradeToPasswordlessUser({
  anonymousId,
  email,
}: {
  anonymousId: string;
  email: string;
}) {
  // 1.2) already logged as anonymous, upgrade to passwordless with email
  const Users = await getUsersCollection<UserDocument>();
  // const anonymousUser = (
  //   await UserMongooseModel.findById(anonymousId)
  // )?.toObject();

  const anonymousUser = await loadUser({ userId: anonymousId });
  if (!anonymousUser) {
    throw new Error(
      `Got anonymousId ${anonymousId} but no user is matching in database. Cannot upgrade account`
    );
  }
  // @ts-ignore
  const upgradedUser: UserDocument = {
    ...(anonymousUser as UserDocument),
    emailHash: createEmailHash(email),
    isVerified: true,
    authMode: "passwordless",
  };

  await Users.updateOne(
    { _id: anonymousId },
    {
      $set: {
        ...upgradedUser,
      },
    }
  );
  return await Users.findOne({ _id: anonymousId });
}

/**
 * Create the user after they clicked the first magic link
 */
export const createOrUpgradeUser = async ({
  anonymousId,
  email,
  ...otherUserProps
}: {
  email: string;
  /** Upgrade an existing anonymous user to "passwordless" with email */
  anonymousId?: string;
} & Partial<UserDocument>) => {
  if (!anonymousId) {
    return await createPasswordlessUser({ email, ...otherUserProps });
  } else {
    return await upgradeToPasswordlessUser({
      anonymousId,
      email,
      ...otherUserProps,
    });
  }
};
