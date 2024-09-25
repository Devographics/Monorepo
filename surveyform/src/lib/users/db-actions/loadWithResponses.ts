import { getUsersCollection } from "@devographics/mongo";
import {
  UserDocument,
} from "~/lib/users/typings";
import { populateUserResponses } from "~/lib/responses/db-actions/populateUserResponses";

/**
 * Load only minimal data about the user
 * @param param0
 * @returns
 */
export const loadUserWithResponses = async ({ userId }) => {
  const Users = await getUsersCollection<UserDocument>();
  const user = await Users.findOne(
    { _id: userId },
    { projection: { createdAt: true, authMode: true, isVerified: true } }
  );
  const userWithResponses = user && populateUserResponses({ user });
  return userWithResponses;
};
