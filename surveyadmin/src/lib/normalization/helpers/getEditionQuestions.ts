import { EditionMetadata, QuestionWithSection } from "@devographics/types";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) => s.questions.map((q) => ({ ...q, section: s })))
    .flat();
