import get from "lodash/get.js";
import sortBy from "lodash/sortBy.js";
import {
  EditionMetadata,
  SurveyMetadata,
  QuestionTemplateOutput,
  SectionMetadata,
  QuestionWithSection,
  NormalizedResponseDocument,
} from "@devographics/types";
import { getNormResponsesCollection } from "@devographics/mongo";
import { getFromCache } from "@devographics/fetch";
import { getQuestionObject } from "./getQuestionObject";
import { getAllResponsesSelector } from "./getSelectors";
import { CommonOptions } from "@devographics/fetch/types";
import { ResponsesResult } from "../normalize/helpers";

export const getAllResponsesCacheKey = ({ survey, edition, question }) =>
  `surveyadmin__${edition.id}__${question.id}__allResponses`;

export const getAllResponses = async (
  options: CommonOptions & {
    survey: SurveyMetadata;
    edition: EditionMetadata;
    section: SectionMetadata;
    question: QuestionTemplateOutput;
  }
) => {
  const { survey, edition, section, question, ...rest } = options;
  return await getFromCache<ResponsesResult>({
    key: getAllResponsesCacheKey({ survey, edition, question }),
    fetchFunction: async () => {
      const questionObject = getQuestionObject({
        survey,
        edition,
        section,
        question,
      })!;
      const rawFieldPath = questionObject?.normPaths?.raw!;
      const normalizedFieldPath = questionObject?.normPaths?.other!;
      const metadataFieldPath = questionObject?.normPaths?.metadata!;

      const selector = getAllResponsesSelector({
        edition,
        questionObject,
      });

      const NormResponses = await getNormResponsesCollection();
      let responses = await NormResponses.find(selector, {
        projection: {
          _id: 1,
          responseId: 1,
          [rawFieldPath]: 1,
          [normalizedFieldPath]: 1,
          [metadataFieldPath]: 1,
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
          metadata: get(r, metadataFieldPath),
        };
      });

      return {
        normalizationResponses,
        rawFieldPath,
        normalizedFieldPath,
        metadataFieldPath,
        selector,
      };
    },
    shouldCompress: true,
    ...rest,
  });
};
