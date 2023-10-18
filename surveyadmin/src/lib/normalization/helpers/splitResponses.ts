import isEmpty from "lodash/isEmpty.js";
import { NormalizationResponse } from "../hooks";
import { NO_MATCH } from "@devographics/constants";

const hasNoMatch = (normalizedValue) =>
  isEmpty(normalizedValue) || normalizedValue?.includes(NO_MATCH);

export function splitResponses(responses: NormalizationResponse[]) {
  const normalizedResponses = responses.filter(
    (r) => !hasNoMatch(r.normalizedValue)
  );
  const unnormalizedResponses = responses.filter((r) =>
    hasNoMatch(r.normalizedValue)
  );
  return { normalizedResponses, unnormalizedResponses };
}
