import { fetchQuestionData, getQuestionDataQuery } from "@devographics/fetch";
import { NormalizationMetadata } from "@devographics/types";
import { calculateWordFrequencies } from "@devographics/helpers";
import { NO_MATCH } from "@devographics/constants";
import { getAllResponses } from "../helpers/getAllResponses";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";

export interface GetWordFrequenciesArgs {
  surveyId: string;
  editionId: string;
  sectionId: string;
  questionId: string;
  shouldGetFromCache: boolean;
}

const isNormalized = (metadata: NormalizationMetadata) =>
  metadata.tokens && metadata.tokens.some((t) => t.id !== NO_MATCH);

export const getWordFrequencies = async ({
  surveyId,
  editionId,
  sectionId,
  questionId,
  shouldGetFromCache = true,
}: GetWordFrequenciesArgs) => {
  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  const { data, duration: getAllResponsesDuration } = await getAllResponses({
    survey,
    edition,
    section,
    question,
    shouldGetFromCache,
  });

  const { normalizationResponses, selector } = data;

  const allResponses = normalizationResponses;

  const allAnswers = allResponses
    .map((r) => r.metadata)
    .flat() as NormalizationMetadata[];
  const normalizedAnswers = allAnswers.filter(isNormalized);
  const unnormalizedAnswers = allAnswers.filter((a) => !isNormalized(a));

  const frequencies = {
    normalized: calculateWordFrequencies(normalizedAnswers.map((m) => m?.raw)),
    unnormalized: calculateWordFrequencies(
      unnormalizedAnswers.map((m) => m?.raw)
    ),
    all: calculateWordFrequencies(allAnswers.map((m) => m?.raw)),
  };
  return { data: frequencies };
};
