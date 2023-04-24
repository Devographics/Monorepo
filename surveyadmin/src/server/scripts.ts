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
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";
import { logToFile } from "@devographics/core-models/server";
// import { getSurveyBySlug } from "~/modules/surveys/helpers";
import surveys from "~/surveys";
import type { Field } from "@devographics/core-models";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
import { createEmailHash } from "~/account/email/api/encryptEmail";

import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

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

const fieldsToAddChoicesTo = [
  "yearly_salary",
  "years_of_experience",
  "company_size",
  "gender",
  "race_ethnicity",
  "job_title",
  "css_proficiency",
  "javascript_proficiency",
  "backend_proficiency",
];

// user_info.yearly_salary => user_info.yearly_salary.choices
export const addChoicesSuffixToUserInfoFields = async () => {
  await connectToAppDb();

  console.log("// addChoicesSuffixToUserInfoFields");

  // note: we can't rename user_info.foo to user_info.foo.choices
  // because they both share the same subfield path, so first we
  // move the field we want to rename to temporary user_info_temp subfield

  // find all fields with user_info.foo but not user_info.foo.choices
  const selector1: { $or: any[] } = { $or: [] };
  fieldsToAddChoicesTo.forEach((fieldName) => {
    selector1.$or.push({
      $and: [
        { [`user_info.${fieldName}`]: { $exists: true, $nin: [null, "", []] } },
        { [`user_info.${fieldName}.choices`]: { $exists: false } },
      ],
    });
  });
  console.log("// selector1");
  console.log(JSON.stringify(selector1, null, 2));

  const rename1: any = {};
  fieldsToAddChoicesTo.forEach((fieldName) => {
    rename1[`user_info.${fieldName}`] = `user_info_temp.${fieldName}`;
  });
  const operation1 = {
    $rename: rename1,
  };
  console.log("// operation1");
  console.log(operation1);

  const result1 = await NormalizedResponseMongooseModel.updateMany(
    selector1,
    operation1
  );
  console.log("// result1");
  console.log(result1);

  // rename user_info_temp.foo to user_info.foo.choices
  const rename2: any = {};
  fieldsToAddChoicesTo.forEach((fieldName) => {
    rename2[`user_info_temp.${fieldName}`] = `user_info.${fieldName}.choices`;
  });
  const operation2 = {
    $rename: rename2,
  };
  console.log("// operation2");
  console.log(operation2);

  const result2 = await NormalizedResponseMongooseModel.updateMany(
    { user_info_temp: { $exists: true } },
    operation2
  );
  console.log("// result2");
  console.log(result2);

  // unset all user_info_temp subfields to clean up
  const result3 = await NormalizedResponseMongooseModel.updateMany(
    { user_info_temp: { $exists: true } },
    { $unset: { user_info_temp: 1 } }
  );
  console.log("// result3");
  console.log(result3);
};

const fieldsToRemoveChoicesFrom = [
  "race_ethnicity",
  "css_proficiency",
  "javascript_proficiency",
  "backend_proficiency",
];

// user_info.yearly_salary => user_info.yearly_salary.choices
export const fixChoicesChoices = async () => {
  await connectToAppDb();

  console.log("// addChoicesSuffixToUserInfoFields");

  for (const fieldName of fieldsToRemoveChoicesFrom) {
    console.log(`//// fieldName: ${fieldName}`);

    // note: we can't rename user_info.foo to user_info.foo.choices
    // because they both share the same subfield path, so first we
    // move the field we want to rename to temporary user_info_temp subfield

    // find all fields with user_info.foo but not user_info.foo.choices
    const selector1 = {
      [`user_info.${fieldName}.choices.choices`]: { $exists: 1 },
    };
    console.log("// selector1");
    console.log(selector1);
    const operation1 = {
      $rename: {
        [`user_info.${fieldName}.choices`]: `user_info_temp.${fieldName}`,
      },
    };
    console.log("// operation1");
    console.log(operation1);

    const result1 = await NormalizedResponseMongooseModel.updateMany(
      selector1,
      operation1
    );
    console.log("// result1");
    console.log(result1);

    // rename user_info_temp.foo to user_info.foo.choices
    const selector2 = { [`user_info_temp.${fieldName}`]: { $exists: true } };
    console.log("// selector2");
    console.log(selector2);
    const operation2 = {
      $rename: { [`user_info_temp.${fieldName}`]: `user_info.${fieldName}` },
    };
    console.log("// operation2");
    console.log(operation2);

    const result2 = await NormalizedResponseMongooseModel.updateMany(
      selector2,
      operation2
    );
    console.log("// result2");
    console.log(result2);
  }

  // unset all user_info_temp subfields to clean up
  const result3 = await NormalizedResponseMongooseModel.updateMany(
    { user_info_temp: { $exists: true } },
    { $unset: { user_info_temp: 1 } }
  );
  console.log("// result3");
  console.log(result3);
};

// $unset: {
//   services: 1,
//   emails: 1,
//   email: 1,
//   displayName: 1,
//   slug: 1,
//   legacyHash: 1,
//   legacyEmailHash: 1,
// },
