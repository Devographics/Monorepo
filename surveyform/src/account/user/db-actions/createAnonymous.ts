import { UserDocument } from "~/account/user/typings";

import { newMongoId } from "@devographics/mongo";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      // maybe overwritten later on, but we generate a string _id here to guarantee we don't accidentaly use MongoId
      _id: newMongoId(),
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };

/*
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
*/