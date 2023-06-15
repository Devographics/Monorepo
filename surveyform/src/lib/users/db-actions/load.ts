import { getUsersCollection } from "@devographics/mongo";
import { UserDocument } from "~/account/user/typings";

/**
 * Load only minimal data about the user
 * @param param0
 * @returns
 */
export const loadUser = async ({ userId }) => {
  const Users = await getUsersCollection<UserDocument>();
  const currentUser = await Users.findOne(
    { _id: userId },
    { projection: { createdAt: true, authMode: true, isVerified: true } }
  );
  return currentUser as UserDocument;
};
