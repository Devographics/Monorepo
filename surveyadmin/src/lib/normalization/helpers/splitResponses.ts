import { NormalizationResponse } from "../hooks";
import {
  AI_NORMALIZATION,
  CUSTOM_NORMALIZATION,
  DISCARDED_ANSWER,
} from "@devographics/constants";
import { NormalizationMetadata } from "@devographics/types";

/*

Take an array of responses (each of which can contain one or more sub-answers)
and split the answers into normalized/unnormalized batches

*/
export interface IndividualAnswer extends NormalizationMetadata {
  _id: string;
  responseId: string;
  answerIndex: number;
}
export interface IndividualAnswerWithIndex extends IndividualAnswer {
  index: number;
}

const answerHasMatch = (a: NormalizationMetadata) => a.tokens?.length > 0;
const answerIsDiscarded = (a: NormalizationMetadata) =>
  a.tokens.some((t) => t.id === DISCARDED_ANSWER);

export function splitResponses(responses: NormalizationResponse[]) {
  const allAnswers: Array<IndividualAnswer> = responses
    .filter((r) => r.metadata)
    .map((r) =>
      r.metadata!.map((item, answerIndex) => ({
        ...item,
        _id: r._id,
        responseId: r.responseId,
        answerIndex,
      }))
    )
    .flat();

  const unnormalizedAnswers = allAnswers.filter((a) => !answerHasMatch(a));
  const answersWithNormalization = allAnswers.filter((a) => answerHasMatch(a));
  const normalizedAnswers = answersWithNormalization.filter(
    (a) => !answerIsDiscarded(a)
  );
  const discardedAnswers = answersWithNormalization.filter((a) =>
    answerIsDiscarded(a)
  );
  const customAnswers = allAnswers.filter((a) =>
    a?.tokens?.some((t) => t.pattern === CUSTOM_NORMALIZATION)
  );
  const aiAnswers = allAnswers.filter((a) =>
    a?.tokens?.some((t) => t.pattern === AI_NORMALIZATION)
  );

  return {
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
    discardedAnswers,
    customAnswers,
    aiAnswers,
  };
}
