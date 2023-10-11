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

export type NormalizationProgressStats = {
  [key in string]: NormalizationProgressStat;
};

export type NormalizationProgressStat = {
  totalCount: number;
  normalizedCount: number;
  unnormalizedCount: number;
  percentage: number;
};

export const getNormalizationPercentages = async (
  options: CommonOptions & {
    surveyId: string;
    editionId: string;
  }
) => {
  const { surveyId, editionId, shouldGetFromCache = true, ...rest } = options;

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

  return await getFromCache<NormalizationProgressStats>({
    key: getNormalizationPercentagesCacheKey({ survey, edition }),
    fetchFunction: async () => {
      const stats = {};
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

        if (normalizationResponses) {
          const { normalizedResponses, unnormalizedResponses } = splitResponses(
            normalizationResponses
          );

          stats[question.id] = {
            totalCount: normalizationResponses.length,
            normalizedCount: normalizedResponses.length,
            unnormalizedCount: unnormalizedResponses.length,
            percentage: Math.round(
              (normalizedResponses.length * 100) / normalizationResponses.length
            ),
          };
        }
      }
      return stats;
    },

    shouldGetFromCache,
    ...rest,
  });
};
