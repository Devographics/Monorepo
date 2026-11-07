import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import get from "lodash/get";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestions } from "~/lib/normalization/helpers/getEditionQuestions";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";

/*

Comments don't have their own id; a comment is identified by the response it
belongs to (the `responseId` returned by the API's `commentsRaw`, which is the
normalized response `_id`, itself equal to the raw response `_id`) and the
question it was left on.

*/
export const deleteComment = async ({
  surveyId,
  editionId,
  questionId,
  responseId,
  reallyDelete = 0,
}) => {
  if (!surveyId) throw new Error("surveyId not specified");
  if (!editionId) throw new Error("editionId not specified");
  if (!questionId) throw new Error("questionId not specified");
  if (!responseId) throw new Error("responseId not specified");

  console.log(
    `// Finding comment for question "${questionId}" in response "${responseId}" (${surveyId}/${editionId}, reallyDelete = ${reallyDelete})`
  );

  // 1. figure out where the comment is stored for this question
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
  const survey = edition.survey;

  const question = getEditionQuestions(edition).find(
    (q) => q.id === questionId
  );
  if (!question) {
    throw new Error(`Question ${questionId} not found in ${editionId}`);
  }
  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  });
  const rawCommentPath = questionObject.rawPaths?.comment;
  const normCommentPath = questionObject.normPaths?.comment;
  if (!rawCommentPath || !normCommentPath) {
    throw new Error(`Could not find comment paths for question ${questionId}`);
  }

  const rawResponses = await getRawResponsesCollection(survey);
  const normResponses = await getNormResponsesCollection(survey);

  // 2. find the normalized response containing the comment
  const normResponse = await normResponses.findOne({
    _id: responseId,
    editionId,
  });
  if (!normResponse) {
    throw new Error(`Normalized response ${responseId} not found`);
  }
  const normComment = get(normResponse, normCommentPath);
  console.log(
    `// Normalized response: ${
      normComment ? `found comment at ${normCommentPath}` : "no comment found"
    }`
  );

  // 3. find the matching raw response
  const rawResponseId = normResponse.responseId || normResponse._id;
  const rawResponse = await rawResponses.findOne({ _id: rawResponseId });
  const rawComment = rawResponse && rawResponse[rawCommentPath];
  console.log(
    `// Raw response ${rawResponseId}: ${
      !rawResponse
        ? "not found"
        : rawComment
        ? `found comment at ${rawCommentPath}`
        : "no comment found"
    }`
  );

  if (!normComment && !rawComment) {
    throw new Error(`No comment found for ${questionId} in ${responseId}`);
  }

  let rawResult, normResult;
  if (Number(reallyDelete)) {
    console.log(`// Deleting comment…`);

    // 4. unset the comment field in both documents
    if (rawComment) {
      rawResult = await rawResponses.updateOne(
        { _id: rawResponseId },
        { $unset: { [rawCommentPath]: 1 } }
      );
    }
    if (normComment) {
      normResult = await normResponses.updateOne(
        { _id: normResponse._id },
        { $unset: { [normCommentPath]: 1 } }
      );
    }
  }

  return {
    rawCommentPath,
    normCommentPath,
    rawComment,
    normComment,
    rawResult,
    normResult,
  };
};

deleteComment.args = [
  "surveyId",
  "editionId",
  "questionId",
  "responseId",
  "reallyDelete",
];

deleteComment.description = `Delete a specific comment, identified by its question and response id. (default reallyDelete = 0)`;

deleteComment.category = "migrations";
