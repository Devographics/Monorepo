import { renameProcessedField } from "~/lib/normalization/helpers/renameProcessedField";
import { renameRawField } from "~/lib/normalization/helpers/renameRawField";

export const migrateField = async (args) => {
  const {
    surveyId,
    editionId,
    oldSectionId,
    newSectionId,
    oldFieldId,
    newFieldId,
  } = args;

  if (!editionId) {
    throw new Error("editionId not specified");
  }
  if (!oldSectionId) {
    throw new Error("oldSectionId not specified");
  }
  if (!oldFieldId) {
    throw new Error("oldFieldId not specified");
  }

  // 1. rename unprocess field (including all subfields)
  const renameRawFieldResult = await renameRawField({
    surveyId,
    editionId,
    oldSectionId,
    newSectionId,
    oldFieldId,
    newFieldId,
  });

  // 2. rename processed fields
  const renameProcessedFieldResult = await renameProcessedField({
    surveyId,
    editionId,
    oldSectionId,
    newSectionId,
    oldFieldId,
    newFieldId,
  });

  return { renameRawFieldResult, renameProcessedFieldResult };
};

migrateField.args = [
  "surveyId",
  "editionId",
  "oldSectionId",
  "oldFieldId",
  "newSectionId",
  "newFieldId",
];

migrateField.description = `Migrate field to new location`;

migrateField.category = "migrations";
