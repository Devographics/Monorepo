import { getUsersCollection } from "@devographics/mongo";
import { createEmailHash } from "~/lib/email";

const isSimulation = false;
const updateFieldName = "updateLegacyAccounts_15Nov2022";

export const updateLegacyAccountsHashes = async ({ limit = 1000 }) => {
  limit = Number(limit);

  let i = 0;
  const result = { legacyUsersCount: 0, totalModifiedCount: 0 };

  const Users = await getUsersCollection();
  const legacyUsers = await Users.find(
    {
      email: { $exists: true },
      [updateFieldName]: { $exists: false },
    },
    { limit }
  ).toArray();

  result.legacyUsersCount = legacyUsers.length;

  console.log(`// Found ${legacyUsers.length} legacy user accounts`);

  for (const user of legacyUsers) {
    if (i % 100 === 0) {
      console.log(`-> Processing user ${i}/${limit}…`);
    }
    const { _id: userId, email, emailHash } = user;
    const newEmailHash = createEmailHash(email, process.env.ENCRYPTION_KEY);
    const newEmailHash2 = createEmailHash(email, process.env.ENCRYPTION_KEY2);

    if (!isSimulation) {
      const update = await Users.updateOne(
        { _id: userId },
        {
          $set: {
            emailHash: newEmailHash,
            emailHash0: emailHash,
            emailHash1: newEmailHash,
            emailHash2: newEmailHash2,
            [updateFieldName]: true,
          },
        }
      );
      result.totalModifiedCount += update.modifiedCount;
    }
    i++;
  }
  return result;
};

updateLegacyAccountsHashes.args = ["limit"];

updateLegacyAccountsHashes.done = true;

updateLegacyAccountsHashes.description = `Create two new email hashes for VulcanMeteor legacy accounts, based on current and future encryption keys. `;

updateLegacyAccountsHashes.deprecated = true;

export default updateLegacyAccountsHashes;
