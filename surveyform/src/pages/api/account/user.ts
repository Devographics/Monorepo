import { getUsersCollection } from "@devographics/mongo";
import { getSessionFromReq } from "~/account/user/api";
// import { UserMongooseModel } from "~/core/models/user.server";
// import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { apiWrapper } from "~/lib/server/sentry";

async function user(req, res) {
  // await connectToAppDb();
  const session = await getSessionFromReq(req);
  // Get fresh data about the user
  const Users = await getUsersCollection();
  const user = session?._id ? await Users.findOne({ _id: session._id }) : null;
  // const user = session?._id
  //   ? (await UserMongooseModel.findById(session._id))?.toObject()
  //   : null;
  // TODO: apply usual security like mutators would do! In order to filter out the hash
  // @see https://github.com/VulcanJS/vulcan-npm/issues/82
  if (user) {
    user.hash = undefined;
    user.salt = undefined;
    user.password = undefined;
  }
  res.status(200).json({ user: user || null });
}

export default apiWrapper(user);

// seems to be needed whenever we use sentry wrapper
// @see https://github.com/getsentry/sentry-javascript/pull/4139
// @see https://stackoverflow.com/questions/72068083/how-to-solve-api-resolved-without-sending-a-response-fetch-when-using-sentry
// TODO: try updating to Sentry v7 later on to see if it happens again?
// (we tried earlier (09/2022) but had to rollback due to build issues, to be tried again later)
export const config = {
  api: {
    externalResolver: true,
  },
};
