import { createEmailHash } from "~/lib/email";
import {
  getUsersCollection,
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { UserDocument } from "./typings";

export const deleteUser = async ({ email, reallyDelete = 0 }) => {
  const [name, host] = email.split("@");
  const [domain, extension] = host.split(".");
  const cleanEmail = `${name.slice(0, 3)}…@${domain.slice(0, 3)}….${extension}`;
  console.log(
    `// Finding and deleting all user data associated with email "${cleanEmail}" (reallyDelete = ${reallyDelete})`
  );
  let legacyResponses = [] as any[],
    newResponses = [] as any[];

  const users = await getUsersCollection<UserDocument>();
  const responses = await getRawResponsesCollection();
  const normResponses = await getNormResponsesCollection();

  const emailHash1 = createEmailHash(email, process.env.ENCRYPTION_KEY);
  const emailHash2 = createEmailHash(email, process.env.ENCRYPTION_KEY2);

  // 1. look for account with this email (legacy system)
  const legacyUser = await users.findOne({ email });

  if (legacyUser) {
    console.log(`// Found 1 legacy user document`);

    // 2. find responses associated with legacy account (should be none)
    legacyResponses = await responses
      .find({ userId: legacyUser._id })
      .toArray();
    console.log(
      `// Found ${await legacyResponses.length} legacy responses (should be 0)`
    );
  }

  type Match = { [key: string]: string };
  const match: Array<Match> = [{ emailHash1 }, { emailHash2 }];
  if (legacyUser) {
    match.push({ olderUserId: legacyUser?._id });
  }
  // 3. look for newer account pointing to legacy account OR with matching email hash
  const newUser = await users.findOne({
    email: { $exists: false },
    $or: match,
  });

  if (!legacyUser && !newUser) {
    throw new Error(`User with email ${email} not found`);
  }

  // track which field(s) were actually matched
  const matches = [
    { key: "olderUserId", match: newUser?.olderUserId === legacyUser?._id },
    { key: "emailHash1", match: newUser?.emailHash1 === emailHash1 },
    { key: "emailHash2", match: newUser?.emailHash2 === emailHash2 },
  ];

  if (newUser) {
    console.log(
      `// Found 1 new user document (matched on: ${matches
        .map(({ key, match }) => `${key}: ${match}`)
        .join("; ")})`
    );

    // 4. find responses associated with new account
    newResponses = await responses.find({ userId: newUser._id }).toArray();
    console.log(`// Found ${await newResponses.length} legacy responses`);
  }

  // 5. find norm responses associated with raw responses
  const rawResponses = [...legacyResponses, ...newResponses];
  const responseIds = rawResponses.map((r) => r._id);
  const normalizedResponses = await normResponses
    .find({
      responseId: { $in: responseIds },
    })
    .toArray();
  console.log(
    `// Found ${await normalizedResponses.length} total normalized responses`
  );
  const normalizedResponsesIds = normalizedResponses.map((r) => r._id);

  if (Number(reallyDelete)) {
    console.log(`// Deleting everything…`);

    // 6. delete everything
    if (legacyUser) {
      await users.deleteOne({ _id: legacyUser._id });
    }
    if (newUser) {
      await users.deleteOne({ _id: newUser._id });
    }
    await responses.deleteMany({ _id: { $in: responseIds } });
    await normResponses.deleteMany({ _id: { $in: normalizedResponsesIds } });
  }

  return {
    matches,
    legacyUser,
    newUser,
    rawResponses,
    normalizedResponses,
  };
};

deleteUser.args = ["email", "reallyDelete"];

deleteUser.description = `Delete any user and user data associated with an email. (default reallyDelete = 0) `;

deleteUser.category = "migrations";
