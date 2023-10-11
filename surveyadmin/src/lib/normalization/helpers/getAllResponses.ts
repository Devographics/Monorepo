import get from "lodash/get.js";
import sortBy from "lodash/sortBy.js";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { getNormResponsesCollection } from "@devographics/mongo";
import { getFromCache } from "@devographics/fetch";
import { getQuestionObject } from "./getQuestionObject";
import { getAllResponsesSelector } from "./getSelectors";
import { NormalizedResponseDocument, QuestionWithSection } from "../types";
import { CommonOptions } from "@devographics/fetch/types";
import { ResponsesResult } from "../normalize/helpers";

export const getAllResponsesCacheKey = ({ survey, edition, question }) =>
  `surveyadmin__${edition.id}__${question.id}__allResponses`;

export const getAllResponses = async (
  options: CommonOptions & {
    survey: SurveyMetadata;
    edition: EditionMetadata;
    question: QuestionWithSection;
  }
) => {
  const { survey, edition, question, ...rest } = options;
  return await getFromCache<ResponsesResult>({
    key: getAllResponsesCacheKey({ survey, edition, question }),
    fetchFunction: async () => {
      const questionObject = getQuestionObject({
        survey,
        edition,
        section: question.section,
        question,
      })!;
      const rawFieldPath = questionObject?.normPaths?.raw!;
      const normalizedFieldPath = questionObject?.normPaths?.other!;
      const patternsFieldPath = questionObject?.normPaths?.patterns!;

      const selector = getAllResponsesSelector({
        edition,
        questionObject,
      });

      const NormResponses =
        await getNormResponsesCollection<NormalizedResponseDocument>();
      let responses = await NormResponses.find(selector, {
        projection: {
          _id: 1,
          responseId: 1,
          [rawFieldPath]: 1,
          [normalizedFieldPath]: 1,
          [patternsFieldPath]: 1,
        },
        sort: { [rawFieldPath]: 1 },
        //lean: true
      }).toArray();

      // use case-insensitive sort
      responses = sortBy(responses, [
        (response) => String(get(response, rawFieldPath)).toLowerCase(),
      ]);

      // return a simplified NormalizationResponse format
      const normalizationResponses = responses.map((r) => {
        return {
          _id: r._id,
          responseId: r.responseId,
          value: get(r, rawFieldPath),
          normalizedValue: get(r, normalizedFieldPath),
          patterns: get(r, patternsFieldPath),
        };
      });

      return {
        normalizationResponses,
        rawFieldPath,
        normalizedFieldPath,
        patternsFieldPath,
        selector,
      };
    },
    shouldCompress: true,
    ...rest,
  });
};
