import { EditionMetadata } from "@devographics/types";
import { QuestionWithSection } from "../normalize/helpers";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) => s.questions.map((q) => ({ ...q, section: s })))
    .flat();
