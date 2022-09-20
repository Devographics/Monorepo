import get from "lodash/get.js";
import { normalizeResponse } from "../normalization/normalize";
import { UserType } from "~/core/models/user";
import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
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
    normalizedId: string;
    _id: string;
    normalizedFields: Array<any>;
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
    if (!normalization)
      throw new Error(
        `Could not normalize response ${JSON.stringify(document)}`
      );
    const { result, normalizedFields } = normalization;
    results.push({ normalizedId: result._id, _id, normalizedFields });
  }
  return results;
};

export const normalizeIdsTypeDefs = "normalizeIds(ids: [String]): [JSON]";

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
