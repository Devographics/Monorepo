import { EditionMetadata, Entity, SectionMetadata } from "@devographics/types";
import { QuestionWithSection } from "~/lib/surveys/types";
import omit from "lodash/omit";
import compact from "lodash/compact";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) =>
      s.questions.map((q) => ({ ...q, section: omit(s, "questions") }))
    )
    .flat();

export const getEditionEntities = (edition: EditionMetadata): Array<Entity> => {
  const editionQuestions = getEditionQuestions(edition);
  const editionOptions = editionQuestions.map((q) => q.options).flat();
  const allEntities = compact([
    ...editionQuestions.map((q) => q?.entity),
    ...editionOptions.map((q) => q?.entity),
  ]) as Entity[];
  return allEntities;
};
