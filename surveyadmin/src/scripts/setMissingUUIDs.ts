import { getUUID } from "~/lib/email";
import {
  getNormResponsesCollection,
  getUsersCollection,
} from "@devographics/mongo";
import { UserDocument } from "./typings";

const isSimulation = false;

export const setMissingUUIDs = async ({ limit = 20 }) => {
  limit = Number(limit);
  const Users = await getUsersCollection<UserDocument>();

  let i = 0;
  const result = { duplicateAccountsCount: 0, duplicateUsers: [] };

  const NormResponses = await getNormResponsesCollection();
  const normResponses = await NormResponses.find(
    { userId: { $exists: true }, "user_info.uuid": { $exists: false } },
    { limit }
  ).toArray();

  console.log(normResponses.length);

  for (const normResponse of normResponses) {
    if (i % 20 === 0) {
      console.log(`-> Processing normResponse ${i}/${limit}…`);
    }
    const { _id, userId } = normResponse;

    const user = await Users.findOne({ _id: userId });
    if (!user) throw new Error(`Can't find user with _id ${userId}`);

    const { emailHash } = user;
    const uuid = await getUUID(emailHash, userId);

    const update = await Users.updateOne(
      { _id: userId },
      {
        $set: {
          "user_info.uuid": uuid,
        },
      }
    );

    i++;
  }
  return result;
};

setMissingUUIDs.args = ["limit"];

setMissingUUIDs.description = `Add UUIDs (used for cohort tracking) to normalized responses that lack one. `;

setMissingUUIDs.deprecated = true;

export default setMissingUUIDs;
