/*

Rename raw field name while automatically renaming all subfields

Example: "mobile_desktop":

- js2023__tools__mobile_desktop__prenormalized

To:

- js2023__tools__mobile_desktop_others__prenormalized

*/
import { getRawResponsesCollection } from "@devographics/mongo";
import { QuestionWithSection, DbPathsEnum } from "@devographics/types";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { logToFile } from "@devographics/debug";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

export async function renameRawField({
  surveyId,
  editionId,
  sectionId,
  oldFieldId,
  newFieldId,
}: {
  surveyId: string;
  editionId: string;
  sectionId: string;
  oldFieldId: string;
  newFieldId: string;
}) {
  const results: any[] = [];

  const rawResponses = await getRawResponsesCollection();

  //   const { data: edition } = await fetchEditionMetadataAdmin({
  //     surveyId,
  //     editionId,
  //   });

  //   const editionQuestions = getEditionQuestions(edition);

  for (const key of Object.keys(DbPathsEnum)) {
    const subFieldId = DbPathsEnum[key];
    const oldFieldPath = `${editionId}__${sectionId}__${oldFieldId}__${subFieldId}`;
    const newFieldPath = `${editionId}__${sectionId}__${newFieldId}__${subFieldId}`;

    const selector = { editionId, [oldFieldPath]: { $exists: true } };
    const operator = {
      [oldFieldPath]: newFieldPath,
    };

    const result = await rawResponses.updateMany(selector, {
      $rename: operator,
    });
    if (result.modifiedCount > 0) {
      results.push({ operator, result });
    }
  }
  console.log(results);
  return results;
}
