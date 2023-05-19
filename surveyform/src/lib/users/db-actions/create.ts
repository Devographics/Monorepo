import { getUsersCollection, newMongoId } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";

export const createUser = async ({ data }): Promise<UserDocument> => {
  const Users = await getUsersCollection();
  const { insertedId } = await Users.insertOne({
    _id: newMongoId(),
    ...data,
  });
  return await Users.findOne({ _id: insertedId });
};
