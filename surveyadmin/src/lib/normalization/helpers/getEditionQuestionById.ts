import { EditionMetadata } from "@devographics/types";
import { getEditionQuestions } from "./getEditionQuestions";

// export const getFieldPaths = (field: Field) => {
//   const { suffix } = field as ParsedQuestion;
//   const { sectionSegment, fieldSegment } = getFieldSegments(field);
//   const basePath = `${sectionSegment}.${fieldSegment}`;
//   const fullPath = suffix ? `${basePath}.${suffix}` : basePath;
//   const errorPath = `${basePath}.error`;
//   const commentPath = `${basePath}.comment`;
//   const rawFieldPath = `${fullPath}.raw`;
//   const normalizedFieldPath = `${fullPath}.normalized`;
//   const patternsFieldPath = `${fullPath}.patterns`;
//   return {
//     basePath,
//     commentPath,
//     fullPath,
//     errorPath,
//     rawFieldPath,
//     normalizedFieldPath,
//     patternsFieldPath,
//   };
// };

export const getEditionQuestionById = ({
  edition,
  questionId,
}: {
  edition: EditionMetadata;
  questionId: string;
}) => {
  const allQuestions = getEditionQuestions(edition);
  // make sure to narrow it down to the freeform "others" field since the main "choices"
  // field can have the same id
  const question = allQuestions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error(`Could not find field for questionId "${questionId}"`);
  }
  return question;
};
