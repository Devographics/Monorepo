import { fetchQuestionData, getQuestionDataQuery } from "@devographics/fetch";
import { NormalizationMetadata } from "@devographics/types";
import { NO_MATCH } from "@devographics/constants";
import { getAllResponses } from "../helpers/getAllResponses";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";
import sortBy from "lodash/sortBy";

// Define a set of common English stop words
const stopWords: Set<string> = new Set([
  "the",
  "for",
  "a",
  "an",
  "and",
  "or",
  "but",
  "nor",
  "so",
  "yet",
  "at",
  "by",
  "from",
  "of",
  "on",
  "to",
  "with",
  "without",
  "is",
  "in",
  "not",
  "be",
  "it",
  "i",
  "that",
  "like",
  "are",
  "have",
  "no",
  "use",
  "as",
  "when",
  "some",
  "should",
  "more",
  "you",
  "can",
  "being",
  "way",
  "etc",
  "all",
  "need",
  "would",
  "eg",
  "its",
  "do",
  "using",
  "always",
  "there",
  "if",
  "this",
  "cant",
  "just",
  "able",
  "we",
]);

type FrequencyItem = {
  word: string;
  count: number;
};
// Function to calculate word frequencies in an array of strings, excluding stop words
function calculateWordFrequencies(data: string[]) {
  let wordFrequencies: FrequencyItem[] = [];

  data.forEach((sentence) => {
    // Normalize and split the sentence into words
    const words = sentence.toLowerCase().split(/\s+/);

    words.forEach((word) => {
      // Remove any non-alphanumeric characters from the word
      const cleanedWord = word.replace(/[^a-z0-9]+/gi, "");

      // Only add the word if it's not a stop word and not empty
      if (!stopWords.has(cleanedWord) && cleanedWord) {
        const currentWordIndex = wordFrequencies.findIndex(
          (w) => w.word === cleanedWord
        );
        if (currentWordIndex === -1) {
          wordFrequencies.push({ word: cleanedWord, count: 1 });
        } else {
          wordFrequencies[currentWordIndex] = {
            word: cleanedWord,
            count: wordFrequencies[currentWordIndex].count + 1,
          };
        }
      }
    });
  });

  wordFrequencies = wordFrequencies.filter((w) => w.count > 10);
  wordFrequencies = sortBy(wordFrequencies, "count");
  wordFrequencies = wordFrequencies.toReversed();
  return wordFrequencies;
}

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
