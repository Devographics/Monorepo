import { getUsersCollection } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";

export const loadUser = async ({ userId }) => {
  const Users = await getUsersCollection<UserDocument>();
  const currentUser = await Users.findOne(
    { _id: userId },
    { projection: { createdAt: true } }
  );
  return currentUser;
};
