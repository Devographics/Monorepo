import { ResponseMongooseModel } from "~/modules/responses/model.server";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
import { createEmailHash } from "~/account/email/api/encryptEmail";

const isSimulation = true;
const limit = 10000;

export const migrateUserAccounts = async () => {
  await connectToAppDb();

  const result = { legacyUsersCount: 0, duplicateUsers: [] };

  const legacyUsers = await UserMongooseModel.find(
    {
      email: { $exists: true },
      migrated: { $exists: false },
    },
    null,
    { limit }
  );

  result.legacyUsersCount = legacyUsers.length;

  console.log(`// Found ${legacyUsers.length} unmigrated legacy user accounts`);

  for (const user of legacyUsers) {
    const { _id: userId, email } = user;
    const newEmailHash = createEmailHash(email);

    // check if another account with different _id but same hash exists
    const existingNewAccount = await UserMongooseModel.findOne({
      emailHash: newEmailHash,
      _id: {$ne: userId}
    });

    if (existingNewAccount) {
      /*
      
      We found an existing passwordless/anonymous account, assign all
      responses and normalized responses to it

      */
     console.log(existingNewAccount)
      const { _id: newUserId } = existingNewAccount;

      console.log(
        `// Found existing account ${newUserId} with same emailHash as account ${userId}!`
      );
      result.duplicateUsers.push({ user, existingNewAccount });

      const modifier = { $set: { userId: newUserId } };
      if (!isSimulation) {
        ResponseMongooseModel.updateMany({ userId }, modifier);
        NormalizedResponseMongooseModel.updateMany(
          { userId },
          modifier
        );
        // mark old user account to be deleted later
        UserMongooseModel.updateOne(
          { _id: userId },
          { $set: { toDelete: true, migrated: true } }
        );
      }
    } else {
      /*

      We didn't find a new user account so we just convert this one into
      the new format

      */
      if (!isSimulation) {
        UserMongooseModel.updateOne(
          { _id: userId },
          {
            $set: {
              emailHash: newEmailHash,
              authMode: "passwordless",
              isVerified: false,
              groups: [],
              toUnset: true,
              migrated: true,
            },
          }
        );
      }
    }
  }
  console.log('// mua result')
  console.log(result)
  return result;
};

export default migrateUserAccounts;
