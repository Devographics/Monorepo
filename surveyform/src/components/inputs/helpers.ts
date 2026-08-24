import { QuestionMetadata } from "@devographics/types";

export const convertValueToNumber = (
  value: any,
  question: QuestionMetadata,
) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    throw new Error(
      `value ${value} for question ${question.id} should be a number`,
    );
  }
  return numberValue;
};
