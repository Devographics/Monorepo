import {
  User,
  // UserMongooseModel,
  UserTypeServer,
} from "~/lib/users/model.server";
import { UserDocument } from "~/account/user/typings";
import { createMutator, updateMutator } from "@vulcanjs/crud/server";
import { createEmailHash } from "~/account/email/api/encryptEmail";
import { getUsersCollection } from "@devographics/mongo";

export const createOrUpgradeUser = async ({
  anonymousId,
  email,
  meta,
  ...otherUserProps
}: {
  email: string;
  /** Upgrade an existing anonymous user to "passwordless" with email */
  anonymousId?: string;
} & Partial<UserDocument>) => {
  if (!anonymousId) {
    // 1.1) not anonymous, first login: create a user
    // create a new user in the db and return it

    // just to please ts
    const {
      authMode: otherAuthMode,
      meta: any,
      ...otherOtherUserProps
    } = otherUserProps;
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
    const Users = await getUsersCollection<UserDocument>();
    // const anonymousUser = (
    //   await UserMongooseModel.findById(anonymousId)
    // )?.toObject();

    const anonymousUser = await Users.findOne({ _id: anonymousId });
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
