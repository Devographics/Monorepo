import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  ResponseDocument,
  CustomNormalizationDefinition,
} from "@devographics/types";
import without from "lodash/without";
import { AddManualNormalizationArgs } from "./addManualNormalizations";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";

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

  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  if (!edition) {
    throw new Error(`Could not find edition for editionId ${editionId}`);
  }
  console.log(
    `⛰️ Removing manual normalizations for ${editionId}/${questionId}/${responseId}: ${tokens.join(
      ", "
    )}`
  );

  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get the response we're going to operate on
  const response = await rawResponsesCollection.findOne({ _id: responseId });

  if (!response) {
    throw new Error(
      `removeManualNormalizations: no response document found for _id ${responseId}`
    );
  }

  const customNormalizations: CustomNormalizationDefinition[] =
    response.customNormalizations || [];
  const existingNormDefIndex = customNormalizations.findIndex(
    (n) => n.rawPath === rawPath
  );
  const existingNormDef = customNormalizations[existingNormDefIndex];

  if (existingNormDef) {
    // if a custom norm. definition already exists for this field, remove tokens from it
    existingNormDef.tokens = without(existingNormDef.tokens, ...tokens);

    // if there are no more tokens, remove the entire normalization definition
    if (existingNormDef.tokens.length === 0) {
      customNormalizations.splice(existingNormDefIndex, 1);
    }

    const selector = { _id: responseId };
    // if there are no more customNormalizations, unset the whole field
    const operation =
      customNormalizations.length === 0
        ? { $unset: { customNormalizations: 1 } }
        : {
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
