import { EditionMetadata } from "@devographics/types";
import type { QuestionWithSection } from "~/lib/normalization/types";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) => s.questions.map((q) => ({ ...q, section: s })))
    .flat();
