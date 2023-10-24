import { getNormResponsesCollection } from "@devographics/mongo";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { emptyValues } from "~/lib/normalization/helpers/getSelectors";

export async function generateSourceField({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) {
  return await generateSourceField2({
    surveyId: survey.id,
    editionId: edition.id,
  });
}

export async function generateSourceField2({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) {
  const normalizedResponses = await getNormResponsesCollection();

  const fields: any[] = [];
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
  });

  const editionQuestions = getEditionQuestions(edition);

  // potential places to look for source field value
  // note: ordered from lowest to highest priority
  const sourceFields = [
    "referrer",
    "sourcetag",
    "how_did_user_find_out_about_the_survey",
  ];

  const sourceFieldPath = `user_info.source`;

  // for each source field, copy contents to source
  // (later iterations will overwrite previous ones)
  for (const sourceField of sourceFields) {
    // get questionObject
    const question = editionQuestions.find((q) => q.id === sourceField)!;
    if (!question) {
      throw new Error(
        `generateSourceField: could not find question ${editionId}/${sourceField}`
      );
    }
    const questionObject = getQuestionObject({
      survey: edition.survey,
      edition,
      section: question.section,
      question,
    })!;
    const { normPaths } = questionObject;

    if (!normPaths?.base) {
      throw new Error(
        `generateSourceField: could not find base normPath for question ${editionId}/${sourceField}`
      );
    }

    const selector = {
      editionId: edition.id,
      [normPaths.base]: { $exists: true, $nin: emptyValues },
    };

    // MongoDB 4.2+ can use an aggregation pipeline for updates
    const operation = [
      {
        $set: {
          [sourceFieldPath]: `$${normPaths.base}`,
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
}

generateSourceField.args = ["surveyId", "editionId"];

generateSourceField.description = `Generate source field for an edition`;
