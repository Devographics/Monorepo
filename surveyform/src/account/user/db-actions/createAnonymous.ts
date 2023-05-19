import {
  User,
  // UserMongooseModel,
  UserTypeServer,
} from "~/lib/users/model.server";
import { UserDocument } from "~/account/user/typings";
import { createMutator, updateMutator } from "@vulcanjs/crud/server";
import { createEmailHash } from "~/account/email/api/encryptEmail";

import { getUsersCollection, newMongoId } from "@devographics/mongo";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };

const createAnonymousUser = async () => {
  const data = generateAnonymousUser();
  // Create a new anonymous user in the db
  const Users = await getUsersCollection();
  const { insertedId } = await Users.insertOne({
    _id: newMongoId(),
    ...data,
  });
  return await Users.findOne({ _id: insertedId });
};
