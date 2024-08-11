import { fetchSurveysMetadata, getFromCache } from "@devographics/fetch";
import { CommonOptions } from "@devographics/fetch/types";
import { splitResponses } from "../helpers/splitResponses";
import { getNormalizableQuestions } from "../helpers/getNormalizableQuestions";
import { getAllResponses } from "../helpers/getAllResponses";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";

export const getNormalizationPercentagesCacheKey = ({ survey, edition }) =>
  `surveyadmin__${edition.id}__normalizationPercentages`;

export type LoadNormalizationPercentagesArgs = {
  surveyId: string;
  editionId: string;
  forceRefresh?: boolean;
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

  const key = getNormalizationPercentagesCacheKey({ survey, edition });

  const result = await getFromCache<NormalizationProgressStats>({
    key,
    fetchFunction: async () => {
      const stats = {};
      const questions = getNormalizableQuestions({ survey, edition });
      for (const question of questions) {
        const { data, duration: getAllResponsesDuration } =
          await getAllResponses({
            survey,
            edition,
            section: question.section,
            question,
            shouldGetFromCache,
          });

        const { normalizationResponses } = data;

        if (normalizationResponses) {
          const { allAnswers, normalizedAnswers, unnormalizedAnswers } =
            splitResponses(normalizationResponses);

          const totalCount = allAnswers.length;
          const normalizedCount = normalizedAnswers.length;
          const unnormalizedCount = unnormalizedAnswers.length;

          stats[question.id] = {
            totalCount,
            normalizedCount,
            unnormalizedCount,
            percentage: Math.round((normalizedCount * 100) / totalCount),
          };
        }
      }
      return stats;
    },

    shouldGetFromCache,
    ...rest,
  });
  return result;
};
