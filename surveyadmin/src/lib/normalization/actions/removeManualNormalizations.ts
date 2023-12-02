import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  ResponseDocument,
  CustomNormalizationDefinition,
} from "@devographics/types";
import without from "lodash/without";
import { AddManualNormalizationArgs } from "./addManualNormalizations";

/**

Normalize all questions for a specific edition

*/
export const removeManualNormalizations = async (
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
    normRespId,
  } = args;
  const startAt = new Date();

  const { data: surveys } = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }

  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
  if (!edition) {
    throw new Error(`Could not find edition for editionId ${editionId}`);
  }
  console.log(
    `⛰️ Removing manual normalizations for ${editionId}/${questionId}/${responseId}: ${tokens.join(
      ", "
    )}`
  );

  const rawResponsesCollection =
    await getRawResponsesCollection<ResponseDocument>(survey);

  // first, get the response we're going to operate on
  const response = await rawResponsesCollection.findOne({ _id: responseId });

  if (!response) {
    throw new Error(
      `removeManualNormalizations: no response document found for _id ${responseId}`
    );
  }

  const customNormalizations: CustomNormalizationDefinition[] =
    response.customNormalizations || [];
  const existingNormalizationDefinition = customNormalizations.find(
    (n) => n.rawPath === rawPath
  );
  if (existingNormalizationDefinition) {
    // if a custom norm. definition already exists for this field, remove tokens from it
    existingNormalizationDefinition.tokens = without(
      existingNormalizationDefinition.tokens,
      ...tokens
    );

    const selector = { _id: responseId };
    const operation = {
      $set: { customNormalizations },
    };
    const updateResult = await rawResponsesCollection.updateOne(
      selector,
      operation
    );

    return updateResult;
  } else {
    // else, do nothing
    return;
  }
};
