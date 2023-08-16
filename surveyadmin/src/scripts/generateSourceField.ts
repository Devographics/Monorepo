import { getNormResponsesCollection } from "@devographics/mongo";
import { getFormPaths } from "@devographics/templates";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";

export const generateSourceField = async (args) => {
  const normalizedResponses = await getNormResponsesCollection();

  const fields: any[] = [];
  const { surveyId, editionId } = args;

  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
  });

  const section = edition.sections.find((s) => s.id === "user_info")!;

  // potential places to look for source field value
  // note: ordered from lowest to highest priority
  const sourceFields = [
    "referrer",
    "sourcetag",
    "how_did_user_find_out_about_the_survey",
  ];

  const sourceFieldPath = `user_info.source`;

  for (const sourceField of sourceFields) {
    // get questionObject
    const question = section?.questions.find((q) => q.id === sourceField)!;
    const questionObject = getQuestionObject({
      survey: edition.survey,
      edition,
      section,
      question,
    })!;
    const { normPaths } = questionObject;

    const selector = { editionId: edition.id };
    // MongoDB 4.2+ can use an aggregation pipeline for updates
    const operation = [
      {
        $set: {
          [sourceFieldPath]: `$${normPaths?.base}`,
        },
      },
    ];
    // copy value over to source field
    const dbResult = await normalizedResponses.updateMany(selector, operation);
    // push result of operation to array for returning back to client
    fields.push({
      id: sourceField,
      normPaths,
      selector,
      operation,
      dbResult,
    });
  }
  return { fields };
};

generateSourceField.args = ["surveyId", "editionId"];

generateSourceField.description = `Generate source field for an edition`;
