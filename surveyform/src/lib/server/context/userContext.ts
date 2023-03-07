import { UserMongooseModel, UserTypeServer } from "~/core/models/user.server";
import { getSessionFromReq } from "~/account/user/api";
import type { NextApiRequest } from "next";
import type { Request } from "express";

interface UserContext {
  userId?: string;
  currentUser?: UserTypeServer;
}

export const userFromReq = async (req: Request | NextApiRequest) => {
  const session = await getSessionFromReq(req);
  if (!session?._id) return null;
  // Refetch the user from db in order to get the freshest data
  // NOTE: State of app is using "string" _id for legacy reason,
  // be careful during dev that if "users" were seeded with Vulcan Next, the _id might ObjectId, thus failing connection
  // In this case, just drop vulcanusers, the admin user will be recreated during seed
  const user = await UserMongooseModel.findOne({ _id: session._id }); //await UserConnector.findOneById(session._id);
  return user;
};

export const userContextFromReq = async (
  req: Request | NextApiRequest
): Promise<UserContext> => {
  const user = await userFromReq(req);
  if (user) {
    return { userId: user._id, currentUser: user };
  }
  return {};
};
