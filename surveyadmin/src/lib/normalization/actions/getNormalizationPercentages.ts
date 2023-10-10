import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { fetchSurveysMetadata, getFromCache } from "@devographics/fetch";
import { CommonOptions } from "@devographics/fetch/types";
import { splitResponses } from "../helpers/splitResponses";
import { getNormalizableQuestions } from "../helpers/getNormalizableQuestions";
import { getAllResponses } from "../helpers/getAllResponses";
import { NormalizationResponse } from "../hooks";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";

export const getNormalizationPercentagesCacheKey = ({ survey, edition }) =>
  `surveyadmin__${edition.id}__normalizationPercentages`;

export type LoadNormalizationPercentagesArgs = {
  surveyId: string;
  editionId: string;
};

export type NormalizationPercentages = {
  [key in string]: number;
};

export const getNormalizationPercentages = async (
  options: CommonOptions & {
    surveyId: string;
    editionId: string;
  }
) => {
  const { surveyId, editionId, shouldGetFromCache, ...rest } = options;

  const { data: surveys, duration: fetchSurveysMetadataDuration } =
    await fetchSurveysMetadata({ shouldGetFromCache });
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey with id ${surveyId}`);
  }
  const { data: edition, duration: fetchEditionMetadataAdminDuration } =
    await fetchEditionMetadataAdmin({
      surveyId,
      editionId,
      shouldGetFromCache,
    });
  if (!edition) {
    throw new Error(`Could not find edition with id ${editionId}`);
  }

  return await getFromCache<NormalizationPercentages>({
    key: getNormalizationPercentagesCacheKey({ survey, edition }),
    fetchFunction: async () => {
      const percentages = {};
      const questions = getNormalizableQuestions({ survey, edition });
      for (const question of questions) {
        const { data, duration: getAllResponsesDuration } =
          await getAllResponses({
            survey,
            edition,
            question,

            shouldGetFromCache,
          });

        const { normalizationResponses } = data;
        const { normalizedResponses, unnormalizedResponses } = splitResponses(
          normalizationResponses
        );

        percentages[question.id] = Math.round(
          (normalizedResponses.length * 100) / normalizationResponses.length
        );
      }
      return percentages;
    },

    shouldGetFromCache,
    ...rest,
  });
};
