import { getUsersCollection } from "@devographics/mongo";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserDocument } from "~/core/models/user";

export function getToken() {
  const c = cookies();
  return c.get(TOKEN_NAME)?.value;
}
export const getCurrentUser = cache(async () => {
  // await connectToAppDb();
  const token = getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  // Get fresh data about the user
  const Users = await getUsersCollection<UserDocument>();
  // const user = session?._id
  //   ? (await UserMongooseModel.findById(session._id))?.toObject()
  //   : null;
  const user = session?._id ? await Users.findOne({ _id: session._id }) : null;
  return user;
});
