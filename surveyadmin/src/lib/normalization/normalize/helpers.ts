// import { getSetting, runGraphQL, logToFile } from 'meteor/vulcan:core';
import sortBy from "lodash/sortBy.js";
import isEmpty from "lodash/isEmpty.js";
import { logToFile } from "@devographics/debug";
import {
  EditionMetadata,
  SurveyMetadata,
  QuestionTemplateOutput,
  QuestionWithSection,
} from "@devographics/types";
import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { fetchEntities } from "@devographics/fetch";
import { getEditionSelector, ignoreValues } from "../helpers/getSelectors";
import { getSelector } from "../helpers/getSelectors";
import { BulkOperation } from "../types";
import { NormalizationResponse } from "../hooks";
import { generateEntityRules } from "./generateEntityRules";
import { normalize } from "./normalize";

export const cleanupValue = (value) =>
  typeof value === "undefined" || ignoreValues.includes(value) ? null : value;

// Global variable that stores the entities
export let entitiesData: { entities?: any; rules?: any } = {};

export const getEntitiesData = async () => {
  if (isEmpty(entitiesData)) {
    entitiesData = await initEntities();
  }
  return entitiesData;
};

export const initEntities = async () => {
  console.log(`// 🗄️ Initializing entities…`);
  const { data: entities } = await fetchEntities();
  const rules = generateEntityRules(entities);
  console.log(`  -> Initializing entities done`);
  return { entities, rules };
};

/*

Extract matching tokens from a string

*/
const enableLimit = false;
export const stringLimit = enableLimit ? 170 : 1000; // max length of string to try and find tokens in
export const rulesLimit = 2500; // max number of rules to try and match for any given string

/*

Normalize a string value and only keep the first result

*/
export const normalizeSingle = async (options: {
  values: any[];
  entityRules: EntityRule[];
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
  verbose: boolean;
}) => {
  const tokens = await normalize(options);

  // put longer tokens first as a proxy for relevancy
  const sortedTokens = sortBy(tokens, (v) => v.id && v.id.length).reverse();
  return sortedTokens[0];
};

/*

Handle source normalization separately since its value can come from 
three different fields (source field, referrer field, 'how did you hear' field)

*/
// export const normalizeSource = async ({
//   normResp,
//   entityRules,
//   survey,
//   edition,
//   verbose,
// }) => {
//   const tags = [
//     "sources",
//     `sources_${survey.id}`,
//     "surveys",
//     "sites",
//     "podcasts",
//     "youtube",
//     "socialmedia",
//     "newsletters",
//     "people",
//     "courses",
//   ];

//   const rawSource = get(normResp, "user_info.sourcetag");
//   const rawFindOut = get(
//     normResp,
//     "user_info.how_did_user_find_out_about_the_survey"
//   );

//   const rawRef = get(normResp, "user_info.referrer");

//   try {
//     const normSource =
//       rawSource &&
//       (await normalizeSingle({
//         value: rawSource,
//         allRules: entityRules,
//         tags,
//         edition,
//         question: { id: "source" },
//         verbose,
//       }));
//     const normFindOut =
//       rawFindOut &&
//       (await normalizeSingle({
//         value: rawFindOut,
//         allRules: entityRules,
//         tags,
//         edition,
//         question: { id: "how_did_user_find_out_about_the_survey" },
//         verbose,
//       }));
//     const normReferrer =
//       rawRef &&
//       (await normalizeSingle({
//         value: rawRef,
//         allRules: entityRules,
//         tags,
//         edition,
//         question: { id: "referrer" },
//         verbose,
//       }));

//     if (normSource) {
//       return { ...normSource, raw: rawSource };
//     } else if (normFindOut) {
//       return { ...normFindOut, raw: rawFindOut };
//     } else if (normReferrer) {
//       return { ...normReferrer, raw: rawRef };
//     } else {
//       return { raw: compact([rawSource, rawFindOut, rawRef]).join(", ") };
//     }
//   } catch (error) {
//     console.log(
//       `// normaliseSource error for response ${normResp.responseId} with values ${rawSource}, ${rawFindOut}, ${rawRef}`
//     );
//     throw new Error(error);
//   }
// };

/*

Generate normalization rules from entities

*/
export interface EntityRule {
  id: string;
  pattern: RegExp | string;
  tags: Array<string>;
}

export const logAllRules = async () => {
  const { data: allEntities } = await fetchEntities();
  if (allEntities) {
    let rules = generateEntityRules(allEntities);
    rules = rules.map(({ id, pattern, tags }) => ({
      id,
      pattern: pattern.toString(),
      tags,
    }));
    const json = JSON.stringify(rules, null, 2);

    await logToFile("rules.js", "export default " + json, {
      mode: "overwrite",
    });
  } else {
    console.log("// Could not get entities");
  }
};

/*

Get responses count for an entire edition

*/
export const getEditionResponsesCount = async ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const selector = await getEditionSelector({
    survey,
    edition,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const responsesCount = await rawResponsesCollection.countDocuments(selector);
  return responsesCount;
};

/*

Get responses count for an entire edition

*/
export const getEditionNormalizedResponsesCount = async ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const selector = await getEditionSelector({
    survey,
    edition,
  });

  const normResponsesCollection = await getNormResponsesCollection(survey);
  const responsesCount = await normResponsesCollection.countDocuments(selector);
  return responsesCount;
};

/*

Get responses count for a specific question

*/
export const getQuestionResponsesCount = async ({
  survey,
  edition,
  question,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}) => {
  const selector = await getSelector({
    survey,
    edition,
    question,
    // onlyUnnormalized,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const responsesCount = await rawResponsesCollection.countDocuments(selector);
  return responsesCount;
};

export type ResponsesResult = {
  // note: do not include raw responses in this because it then becomes too large to
  // store in Redis
  // responses: WithId<NormalizedResponseDocument>[];
  normalizationResponses: NormalizationResponse[];
  rawFieldPath: string;
  normalizedFieldPath: string;
  patternsFieldPath: string;
  selector: any;
};

/**
 * Replace/update one element, with a declarative bulk configuration so we can run many operations
 * We may need multiple operations for one element (replacement = deletion then insertion)
 */
export const getBulkOperations = ({
  selector,
  modifier,
  isReplace,
}: {
  selector: any;
  modifier: any;
  isReplace: boolean;
}): Array<BulkOperation> => {
  return isReplace
    ? [
        /*
    - "replaceOne" doesn't allow for update operators
    https://www.mongodb.com/docs/v7.0/reference/method/db.collection.replaceOne/
    This means it does not let use use "$setOnInsert" to guarantee a string id when the "upsert" is an insert

    - updateOne is not suited either, as it would keep unmodified fields around but we want to delete them)

    - a deletion followed by an insertion is more reliable. 
    **The only difference with replaceOne, is that it will change the document _id everytime we replace the normalized response**
    Computing a value that is not random (eg based on responseId) can create bugs if we create more than 1 normalized response
    */
        {
          replaceOne: {
            filter: selector,
            replacement: { ...modifier, _id: modifier.responseId },
            upsert: true,
          },
        },
        // {
        //   deleteOne: {
        //     filter: selector,
        //   },
        // },
        // {
        //   insertOne: {
        //     document: { _id: newMongoId(), ...modifier },
        //   },
        // },
      ]
    : [
        {
          updateMany: {
            filter: selector,
            update: modifier,
            upsert: false,
          },
        },
      ];
};

export const getDuration = (startAt, endAt) =>
  Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
