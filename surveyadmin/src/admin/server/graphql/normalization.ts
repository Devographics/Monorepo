import get from "lodash/get.js";
import { normalizeResponse } from "../normalization/normalize";
import { UserType } from "~/core/models/user";
import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
import { getOrFetchEntities } from "~/modules/entities/server";
import pick from "lodash/pick.js";

/*

Normalization

*/
export const normalizeIds = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  // if (!Users.isAdmin(currentUser)) {
  //   throw new Error('You cannot perform this operation');
  // }
  const results: Array<{
    normalizedResponseId?: string;
    responseId?: string;
    normalizedFields?: Array<any>;
  }> = [];

  if (!currentUser.isAdmin) throw new Error("Non admin cannot normalize ids");

  const { ids } = args;
  // TODO: use Response model and connector instead
  const responses = await ResponseAdminMongooseModel.find({
    _id: { $in: ids },
  });
  for (const document of responses) {
    const { _id } = document;
    const normalization = await normalizeResponse({ document, verbose: true });
    if (!normalization) {
      throw new Error(
        `Could not normalize response ${JSON.stringify(document)}`
      );
    }
    results.push(normalization);
  }
  return results;
};

export const normalizeIdsTypeDefs = "normalizeIds(ids: [String]): [JSON]";

/*

Normalization (entire survey)

*/
const defaultLimit = 999;
const isSimulation = false;
const verbose = false;
export const normalizeSurvey = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  const { surveyId, startFrom = 0, limit = defaultLimit } = args;
  const startAt = new Date();
  let progress = 0;

  const metadata: {
    surveyId: string;
    normalizedDocuments: any[];
    duration?: number;
    count?: number;
    errorCount: number;
  } = { surveyId, normalizedDocuments: [], errorCount: 0 };

  if (!currentUser.isAdmin)
    throw new Error("Non admin cannot normalize surveys");

  const entities = await getOrFetchEntities();

  // TODO: use Response model and connector instead
  const responses = await ResponseAdminMongooseModel.find({
    surveySlug: surveyId,
  }).skip(startFrom).limit(limit);
  const count = responses.length;
  metadata.count = count;
  const tickInterval = Math.round(count / 200);

  console.log(
    `// Renormalizing survey ${surveyId}… Found ${count} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  for (const response of responses) {
    const normalizationResult = await normalizeResponse({
      document: response,
      verbose,
      isSimulation,
      entities,
    });

    progress++;
    if (limit > 1000 && progress % tickInterval === 0) {
      console.log(`  -> Normalized ${progress}/${count} responses…`);
    }

    if (!normalizationResult) {
      metadata.errorCount++;
      metadata.normalizedDocuments.push({
        responseId: response._id,
        errors: [
          {
            type: "normalization_failed",
            documentId: response._id,
          },
        ],
      });
    } else {
      if (normalizationResult.errors.length > 0) {
        metadata.errorCount += normalizationResult.errors.length;
      }
      metadata.normalizedDocuments.push(
        pick(normalizationResult, [
          "errors",
          "responseId",
          "normalizedResponseId",
          "normalizedFieldsCount",
          "prenormalizedFieldsCount",
          "regularFieldsCount",
        ])
      );
    }
  }

  const endAt = new Date();
  const duration = Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
  // duration in seconds
  metadata.duration = duration;
  console.log(
    `-> Done renormalizing ${count} responses in survey ${surveyId}. (${endAt}) - ${
      duration / 60
    } min`
  );

  return metadata;
};

export const normalizeSurveyTypeDefs =
  "normalizeSurvey(surveyId: String, startFrom: Int, limit: Int): JSON";


/*

Get survey metadata

*/
export const getSurveyMetadata = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  const { surveyId } = args;
  if (!currentUser.isAdmin)
    throw new Error("Non admin cannot do this");

  // TODO: use Response model and connector instead
  const responses = await ResponseAdminMongooseModel.find({
    surveySlug: surveyId,
  });

  return { responsesCount: responses.length};
};
export const getSurveyMetadataTypeDefs =
"getSurveyMetadata(surveyId: String): JSON";

/*

Normalization Debugging

*/
export const surveyNormalization = async (root, { surveySlug, fieldName }) => {
  console.log(`// surveyNormalization ${surveySlug} ${fieldName}`);
  const [initialSegment, sectionSegment, fieldSegment, ...restOfPath] =
    fieldName.split("__");
  let rawFieldPath = `${sectionSegment}.${fieldSegment}.others.raw`;
  let normalizedFieldPath = `${sectionSegment}.${fieldSegment}.others.normalized`;
  if (fieldSegment === "source") {
    // treat source field differently because it doesn't have "others"
    rawFieldPath = "user_info.source.raw";
    normalizedFieldPath = "user_info.source.normalized";
  }
  const query = {
    surveySlug,
    [rawFieldPath]: { $exists: true },
    $or: [
      { [normalizedFieldPath]: [] },
      { [normalizedFieldPath]: { $exists: false } },
    ],
  };

  console.log(query)
  
  const responses = await NormalizedResponseMongooseModel.find(
    query,
    {
      _id: 1,
      responseId: 1,
      [rawFieldPath]: 1,
    },
    { lean: true }
  ).exec();

  const cleanResponses = responses.map((r) => {
    return {
      _id: r._id,
      responseId: r.responseId,
      value: get(r, rawFieldPath),
    };
  });

  return cleanResponses;
};

export const surveyNormalizationTypeDefs =
  "surveyNormalization(surveySlug: String, fieldName: String): [JSON]";
