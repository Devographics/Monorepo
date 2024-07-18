/*

Migrate tools paths in raw responses from:

- react2023__other_tools__other_services__upstash__followup_predefined
- react2023__tools_others__back_end_infrastructure_pain_points

To:

- react2023__tools__other_services__upstash__followup_predefined
- react2023__tools__back_end_infrastructure_pain_points

*/
import { getRawResponsesCollection } from "@devographics/mongo";
import { QuestionWithSection } from "@devographics/types";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { logToFile } from "@devographics/debug";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

export async function migrateToolsPaths({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) {
  const fields: any[] = [];

  const rawResponses = await getRawResponsesCollection();

  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
  });

  const editionQuestions = getEditionQuestions(edition);

  const toolQuestions = editionQuestions.map((question) =>
    getQuestionObject({
      survey: edition.survey,
      edition,
      section: question.section,
      question,
    })
  );

  if (toolQuestions.length === 0) {
    throw new Error(`// migrateToolsPaths: no tool questions found`);
  }

  const selector = { editionId };

  /*
  
    Get all responses and iterate on them
  
    */
  const total = await rawResponses.countDocuments(selector);
  const totalSteps = Math.floor(total / operationsPerStep);

  for (let step = 0; step <= totalSteps; step++) {
    console.log(
      `// Processing responses ${step * operationsPerStep}-${
        (step + 1) * operationsPerStep
      } out of ${total}…`
    );

    const allResponses = await rawResponses
      .find(selector)
      .skip(step * operationsPerStep)
      .limit(operationsPerStep);

    const bulkOperations: any[] = [];
    let count = 0;
    for await (const response of allResponses) {
      count++;

      const renameObject = {};
      // iterate over all fields
      for (const fieldPath of Object.keys(response)) {
        // look for field paths that contain these segments
        const segments = ["tools_others__", "other_tools__"];
        for (const segmentToReplace of segments) {
          if (fieldPath.includes(segmentToReplace)) {
            renameObject[fieldPath] = fieldPath.replace(
              segmentToReplace,
              "tools__"
            );
          }
        }
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: response._id },
          update: { $rename: renameObject },
        },
      });
    }
    logToFile(
      `migrateToolsPaths/${editionId}/step_${step}.json`,
      bulkOperations
    );
    const operationResult = await rawResponses.bulkWrite(bulkOperations, {
      ordered: false,
    });

    console.log("// operationResult:");
    console.log(operationResult);
  }
  return { fields };
}
