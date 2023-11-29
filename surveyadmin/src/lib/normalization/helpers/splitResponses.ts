import isEmpty from "lodash/isEmpty.js";
import { NormalizationResponse } from "../hooks";
import { NO_MATCH } from "@devographics/constants";
import { NormalizationMetadata } from "../types";

/*

Take an array of responses (each of which can contain one or more sub-answers)
and split the answers into normalized/unnormalized batches

*/
export interface IndividualAnswer extends NormalizationMetadata {
  _id: string;
  responseId: string;
}

const answerHasMatch = (a: NormalizationMetadata) => a.tokens?.length > 0;

export function splitResponses(responses: NormalizationResponse[]) {
  const allAnswers: Array<IndividualAnswer> = responses
    .filter((r) => r.metadata)
    .map((r) =>
      r.metadata!.map((item) => ({
        ...item,
        _id: r._id,
        responseId: r.responseId,
      }))
    )
    .flat();

  const normalizedAnswers = allAnswers.filter((a) => answerHasMatch(a));
  const unnormalizedAnswers = allAnswers.filter((a) => !answerHasMatch(a));

  return { allAnswers, normalizedAnswers, unnormalizedAnswers };
}
