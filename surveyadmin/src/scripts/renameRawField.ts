import { renameRawField as renameRawField_ } from "~/lib/normalization/helpers/renameRawField";

export const renameRawField = async (args) => {
  const { surveyId, editionId, sectionId, oldFieldId, newFieldId } = args;
  return await renameRawField_({
    surveyId,
    editionId,
    sectionId,
    oldFieldId,
    newFieldId,
  });
};

renameRawField.args = [
  "surveyId",
  "editionId",
  "sectionId",
  "oldFieldId",
  "newFieldId",
];

renameRawField.description = `Rename raw responses field path`;

renameRawField.deprecated = true;
