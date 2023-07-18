import { EditionMetadata } from "@devographics/types";
import { QuestionWithSection } from "~/lib/surveys/types";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) => s.questions.map((q) => ({ ...q, section: s })))
    .flat();
