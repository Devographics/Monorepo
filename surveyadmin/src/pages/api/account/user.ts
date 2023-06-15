import { getUsersCollection } from "@devographics/mongo";
import { getSession } from "~/account/user/api";


async function user(req, res) {
  const Users = await getUsersCollection()
  const session = await getSession(req);
  // Get fresh data about the user
  const user = session?._id
    ? (await Users.findOne({ _id: session._id }))?.toObject()
    : null;
  // TODO: apply usual security like mutators would do! In order to filter out the hash
  // @see https://github.com/VulcanJS/vulcan-npm/issues/82
  if (user) {
    user.hash = undefined;
    user.salt = undefined;
    user.password = undefined;
  }
  res.status(200).json({ user: user || null });
}

export default user;
