import type { Model } from "mongoose";
import { normalizeResponse } from "../admin/server/normalization/normalize";
import { fetchEntities } from "~/modules/entities/server";
// import Users from 'meteor/vulcan:users';
//import {
//  js2019FieldMigrations,
//  normalizeJS2019Value,
//  otherValueNormalisations,
//} from "./migrations";
import { ResponseMongooseModel } from "~/modules/responses/model.server";
// import { NormalizedResponseMongooseModel } from "~/modules/normalized_responses/model.server";
import { createEmailHash } from "~/account/email/api/encryptEmail";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { logToFile } from "@devographics/core-models/server";
// import { getSurveyBySlug } from "~/modules/surveys/helpers";
import surveys from "~/surveys";
import type { Field } from "@devographics/core-models";

/*

Migrations

*/
export const renameFieldMigration = async (
  collection: Model<any>,
  field1,
  field2
) => {
  await connectToAppDb();

  const result = await collection.updateMany(
    { [field1]: { $exists: true } },
    { $rename: { [field1]: field2 } }
  );

  const emoji = result.modifiedCount === 0 ? "" : "✅";
  // eslint-disable-next-line no-console
  console.log(
    `// ${emoji} ${field1} -> ${field2} migration done, renamed ${result.modifiedCount} fields `
  );
};

/*

Renormalize a survey's results

*/
const renormalizeSurvey = async (surveySlug) => {
  await connectToAppDb();

  const fileName = `${surveySlug}_normalization`;
  const limit = 99999;
  // const survey = getSurveyBySlug(surveySlug);
  const selector = { surveySlug };
  const entities = await fetchEntities();

  console.log(`// found ${entities?.length} entities`);

  // for (const s of survey.outline) {
  //   for (const field of s.questions) {
  //     const { fieldName } = field;
  //     const [initialSegment, ...restOfPath] = fieldName.split('__');
  //     if (last(restOfPath) === 'others') {
  //       selector['$or'].push({ [fieldName]: { $exists: true } });
  //     }
  //   }
  // }

  const startAt = new Date();
  let progress = 0;
  const responsesCursor = ResponseMongooseModel.find(selector, null, { limit });
  const count = await responsesCursor.clone().count();
  const tickInterval = Math.round(count / 200);

  await logToFile(
    `${fileName}.txt`,
    "id, fieldName, value, matchTags, id, pattern, rules, match \n",
    { mode: "overwrite" }
  );
  await logToFile(`${fileName}.txt`, "", { mode: "overwrite" });
  await logToFile("normalization_errors.txt", "", { mode: "overwrite" });

  console.log(
    `// Renormalizing survey ${surveySlug}… Found ${count} responses to renormalize. (${startAt})`
  );

  const responses = await responsesCursor.clone().exec();
  for (const response of responses) {
    try {
      // console.log(progress, progress % tickInterval, response._id);
      await normalizeResponse({
        document: response,
        entities,
        log: true,
        fileName,
        verbose: false,
      });
      progress++;
      if (progress % tickInterval === 0) {
        console.log(`  -> Normalized ${progress}/${count} responses…`);
      }
    } catch (error) {
      console.log("// Renormalization error");
      console.log(error);
    }
  }

  // responsesCursor.forEach(async (response) => {
  //   try {
  //     await normalizeResponse({ document: response });
  //     progress++;
  //     if (progress % tickInterval === 0) {
  //       console.log(`  -> Normalized ${progress}/${count} responses…`);
  //     }
  //   } catch (error) {
  //     console.log('// Renormalization error');
  //     console.log(error);
  //   }
  // });

  const endAt = new Date();
  const duration = Math.ceil(
    (endAt.valueOf() - startAt.valueOf()) / (1000 * 60)
  );
  console.log(
    `-> Done renormalizing ${count} responses in survey ${surveySlug}. (${endAt}) - ${duration} min`
  );
};

/*

Log all "currently missing features from CSS" answers to file

*/
export const logField = async (
  collection: Model<any>,
  fieldName,
  surveySlug
) => {
  const selector: any = {
    [fieldName]: {
      $exists: 1,
    },
  };
  if (surveySlug) {
    selector.surveySlug = surveySlug;
  }
  let results = await collection.find(selector, {
    [fieldName]: 1,
  });
  results = results.map((r) => r[fieldName]);
  await logToFile(`${fieldName}.json`, results, { mode: "overwrite" });
};

export async function migrateUserEmails() {
  console.log("// migrateUserEmails");
  // get all users that have a plain-text email stored
  const usersToMigrate = await UserMongooseModel.find({
    email: { $exists: true },
    legacyEmailHash: { $exists: false },
  });
  console.log(`// Found ${usersToMigrate.length} users to migrate…`);
  for (const user of usersToMigrate) {
    const { _id, email, emailHash: legacyEmailHash } = user;
    const newEmailHash = createEmailHash(email);
    const set = { legacyEmailHash, emailHash: newEmailHash };
    console.log(
      `// Updating user ${_id}, email: ${email}, old hash: ${legacyEmailHash}, new hash: ${newEmailHash}`
    );

    const unset = {};
    // for now keep emails for safety, in the future delete them
    // const unset = { email: 1, emails: 1}
    const update = await UserMongooseModel.updateOne(
      { _id },
      { $set: set, $unset: unset }
    );
  }
}

export const renormalizeGraphQL2022 = async () => {
  console.log("// renormalizeGraphQL2022");
  await renormalizeSurvey("graphql2022");
};

export const renameFields = async () => {
  console.log("// renameFields");
  // const questionIds = [
  //   "combining_schemas",
  //   "web_frameworks",
  //   "databases",
  //   "server_languages",
  //   "graphql_ides",
  //   "other_tools",
  // ];
  // for (const id of questionIds) {
  //   const before1 = `graphql2022__tools_others__${id}__choices`;
  //   const after1 =  `graphql2022__tools_others__${id}__choices`;
  //   await renameFieldMigration(ResponseMongooseModel, before1, after1);
  //   const before2 = `graphql2022__tools_others__${id}__others`;
  //   const after2 =  `graphql2022__tools_others__${id}__others`;
  //   await renameFieldMigration(ResponseMongooseModel, before2, after2);
  // }

  // await renameFieldMigration(ResponseMongooseModel, 'graphql2022__usage__strong_points', 'graphql2022__usage__graphql_strong_points');
  // await renameFieldMigration(ResponseMongooseModel, 'graphql2022__usage__pain_points', 'graphql2022__usage__graphql_pain_points');
  // await renameFieldMigration(ResponseMongooseModel, 'graphql2022__usage_others__strong_points', 'graphql2022__usage_others__graphql_strong_points');
  // await renameFieldMigration(ResponseMongooseModel, 'graphql2022__usage_others__pain_points', 'graphql2022__usage_others__graphql_pain_points');

  const suffix = "__choices";

  for (const survey of surveys) {
    for (const s of survey.outline) {
      for (const field of s.questions) {
        const { fieldName, template } = field as Field;
        if (fieldName && template === "single") {
          await renameFieldMigration(
            ResponseMongooseModel,
            fieldName.replace(suffix, ""),
            fieldName
          );
        }
      }
    }
  }
};

// graphql2022__usage__graphql_experience__choices__choices -> graphql2022__usage__graphql_experience__choices
export const fixRenameFields = async () => {
  console.log("// fixRenameFields");

  const suffix = "__choices";

  for (const survey of surveys) {
    for (const s of survey.outline) {
      for (const field of s.questions) {
        const { fieldName, template } = field as Field;
        if (fieldName && template === "single") {
          // note: fieldName already includes the suffix, we just don't want to include it twice
          await renameFieldMigration(
            ResponseMongooseModel,
            `${fieldName}${suffix}`,
            fieldName
          );
        }
      }
    }
  }
};
