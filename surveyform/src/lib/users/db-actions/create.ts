import { getUsersCollection, newMongoId } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";

export const createUser = async ({ data }): Promise<UserDocument> => {
  const Users = await getUsersCollection<UserDocument>();
  const { insertedId } = await Users.insertOne({
    _id: newMongoId(),
    createdAt: new Date(),
    ...data,
  });
  const createdUser = await Users.findOne({ _id: insertedId });
  if (!createdUser) {
    throw new Error(`Could not find user ${insertedId} after creation`);
  }
  return createdUser;
};
