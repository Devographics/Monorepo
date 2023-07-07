import { getUnnormalizedResponses } from "../helpers";
import get from "lodash/get";

export const getUnnormalizedFields = async ({
  surveyId,
  editionId,
  questionId,
}) => {
  console.log(`// unnormalizedFields ${editionId} ${questionId}`);
  if (questionId) {
    const { responses, rawFieldPath } = await getUnnormalizedResponses(
      surveyId,
      editionId,
      questionId
    );

    const cleanResponses = responses.map((r) => {
      return {
        _id: r._id,
        responseId: r.responseId,
        value: get(r, rawFieldPath),
      };
    });

    return cleanResponses;
  } else {
    return [];
  }
};
