import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { fetchEntities } from "@devographics/fetch";
import {
  ResponseDocument,
  CustomNormalizationDefinition,
} from "@devographics/types";
import uniq from "lodash/uniq";
import { freeform } from "../normalize/subfields";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";
import { generateEntityRules } from "../normalize/generateEntityRules";

export type AddManualNormalizationArgs = {
  responseId: string;
  normRespId: string;
  surveyId: string;
  editionId: string;
  questionId: string;
  tokens: string[];
  rawValue: string;
  rawPath: string;
};

/*

Get new value of customNormalizations field with added tokens, or initialize it
if it doesn't exist

*/
const addCustomNormalization = ({
  rawPath,
  rawValue,
  tokens,
  response,
}: {
  rawPath: string;
  rawValue: string;
  tokens: string[];
  response: ResponseDocument;
}) => {
  const normalizationDefinition: CustomNormalizationDefinition = {
    rawPath,
    rawValue,
    tokens,
  };

  const customNormalizations: CustomNormalizationDefinition[] =
    response.customNormalizations || [];
  const existingNormalizationDefinition = customNormalizations.find(
    (n) => n.rawPath === rawPath
  );
  if (existingNormalizationDefinition) {
    // if a custom norm. definition already exists for this field, add new tokens to it
    // (removing duplicates in the process)
    existingNormalizationDefinition.tokens = uniq([
      ...existingNormalizationDefinition.tokens,
      ...tokens,
    ]);
  } else {
    // else, add new norm. definition to customNormalizations array
    customNormalizations.push(normalizationDefinition);
  }
  return customNormalizations;
};

/**

Add a manual normalization to a question

*/
export const addManualNormalizations = async (
  args: AddManualNormalizationArgs
) => {
  const {
    surveyId,
    editionId,
    questionId,
    tokens,
    responseId,
    rawValue,
    rawPath,
  } = args;

  const startAt = new Date();

  console.log(
    `⛰️ Adding manual normalizations for ${editionId}/${questionId}/${responseId}: ${tokens.join(
      ", "
    )}`
  );

  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  /*

  1. Raw Response

  */
  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const response = await rawResponsesCollection.findOne({ _id: responseId });

  if (!response) {
    throw new Error(
      `addManualNormalizations: no response document found for _id ${responseId}`
    );
  }

  const customNormalizations = addCustomNormalization({
    rawPath,
    rawValue,
    tokens,
    response,
  });

  const updatedResponse = { ...response, customNormalizations };

  const rawUpdateResult = await rawResponsesCollection.updateOne(
    { _id: responseId },
    {
      $set: { customNormalizations },
    }
  );

  /*

  1. Normalized Response

  */
  const normRespCollection = await getNormResponsesCollection(survey);

  // first, get the response we're going to operate on
  const normResp = await normRespCollection.findOne({ _id: responseId });

  if (!normResp) {
    throw new Error(
      `addManualNormalizations: no normalized response document found for _id ${responseId}`
    );
  }

  const entities = (await fetchEntities()).data;
  const entityRules = generateEntityRules(entities);

  const normResult = await freeform({
    edition,
    response: updatedResponse,
    normResp,
    questionObject: question,
    verbose: true,
    entityRules,
  });

  if (normResult) {
    const { normResp: updatedNormalizedResp } = normResult;

    const selector = { _id: responseId };
    const operation = {
      $set: updatedNormalizedResp,
    };
    const normUpdateResult = await normRespCollection.updateOne(
      selector,
      operation
    );
    return {
      rawUpdateResult,
      normUpdateResult,
      updatedResponse,
      updatedNormalizedResp,
    };
  }
};
