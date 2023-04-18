import { connectToAppDb } from "~/lib/server/mongoose/connection";
import {
  ResponseMongooseModel,
  ResponseMongoCollection,
} from "~/modules/responses/model.server";

export const addEditionIdSurveyId = async () => {
  await connectToAppDb();

  const responses = ResponseMongoCollection();

  const cursor = {
    $or: [{ editionId: { $exists: false } }, { surveyId: { $exists: false } }],
  };

  console.log(
    `// Found ${await responses.countDocuments(
      cursor
    )} responses with missing "editionId" or "surveyId" fields, processing…`
  );

  const update = responses.updateMany(cursor, [
    {
      $set: {
        editionId: "$surveySlug",
        surveyId: { $ifNull: ["$context", "$survey"] },
      },
    },
  ]);

  return update;
};

addEditionIdSurveyId.description = `Add "editionId" and "surveyId" fields to all responses`;

export default addEditionIdSurveyId;
