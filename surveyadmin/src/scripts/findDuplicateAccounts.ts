import { UserMongoCollection } from "~/core/models/user.server";
import { ResponseMongoCollection } from "~/modules/responses/model.server";
import { NormalizedResponseMongoCollection } from "~/admin/models/normalized_responses/model.server";
import { getUsersCollection } from "@devographics/mongo";

export const findDuplicateAccounts = async ({ limit = 10000, skip = 0 }) => {
  limit = Number(limit);
  skip = Number(skip);
  const Users = await getUsersCollection()
  let i = 0;
  const result = { duplicateAccountsCount: 0, duplicateUsers: [] };

  const Users = UserMongoCollection();

  // restrict search to legacy accounts that have an `email` field
  const users = await Users.find({
    emailHash: { $exists: true },
    email: { $exists: true },
    newerUserId: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip);

  const usersArray = await users.toArray();

  console.log(users.length);

  for (const user of usersArray) {
    if (i % 100 === 0) {
      console.log(`-> Processing user ${i}/${limit}…`);
    }
    const { _id, emailHash } = user;

    const newerDuplicateAccount = await Users.findOne({
      emailHash,
      _id: { $ne: _id },
    });
    if (newerDuplicateAccount) {
      console.log(`// Found duplicate accounts for emailHash ${emailHash}`);
      result.duplicateAccountsCount = result.duplicateAccountsCount + 1;

      // store reference to newer account on old account
      const oldUserUpdated = await Users.updateOne(
        { _id: user._id },
        { $set: { newerUserId: newerDuplicateAccount._id } }
      );
      // console.log("// oldUserUpdated");
      // console.log(oldUserUpdated);

      // store reference to old account on newer account
      const newUserUpdated = await Users.updateOne(
        { _id: newerDuplicateAccount._id },
        {
          $set: {
            olderUserId: user._id,
          },
        }
      );
      // console.log("// newUserUpdated");
      // console.log(newUserUpdated);

      const selector = { userId: user._id };
      const modifier = { $set: { userId: newerDuplicateAccount._id } };

      // update all responses and normalized responses to use new userId
      const Responses = await ResponseMongoCollection();
      const responsesUpdated = await Responses.updateMany(selector, modifier);
      // console.log("// responsesUpdated");
      // console.log(responsesUpdated);

      const NormalizedResponses = await NormalizedResponseMongoCollection();
      const normResponesUpdated = await NormalizedResponses.updateMany(
        selector,
        modifier
      );
      // console.log("// normResponesUpdated");
      // console.log(normResponesUpdated);
    }
    i++;
  }

  return result;
};

findDuplicateAccounts.args = ["limit", "skip"];

findDuplicateAccounts.description = `Find users that have the same email hash.`;

export default findDuplicateAccounts;
