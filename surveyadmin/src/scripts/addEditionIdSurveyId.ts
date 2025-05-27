import { getRawResponsesCollection } from "@devographics/mongo";

export const addEditionIdSurveyId = async () => {
  const Responses = await getRawResponsesCollection();

  const cursor = {
    $or: [{ editionId: { $exists: false } }, { surveyId: { $exists: false } }],
  };

  console.log(
    `// Found ${await Responses.countDocuments(
      cursor
    )} responses with missing "editionId" or "surveyId" fields, processing…`
  );

  const update = Responses.updateMany(cursor, [
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

addEditionIdSurveyId.deprecated = true;

export default addEditionIdSurveyId;
