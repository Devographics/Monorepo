import isEmpty from "lodash/isEmpty.js";
import { NormalizationResponse } from "../hooks";

export function splitResponses(responses: NormalizationResponse[]) {
  const normalizedResponses = responses.filter(
    (r) => !isEmpty(r.normalizedValue)
  );
  const unnormalizedResponses = responses.filter((r) =>
    isEmpty(r.normalizedValue)
  );
  return { normalizedResponses, unnormalizedResponses };
}
