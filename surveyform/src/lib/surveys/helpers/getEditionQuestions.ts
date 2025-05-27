import {
  EditionMetadata,
  Entity,
  FeaturesOptions,
  ResponseDocument,
  SectionMetadata,
  SimplifiedSentimentOptions,
} from "@devographics/types";
import { QuestionWithSection } from "~/lib/surveys/types";
import omit from "lodash/omit";
import compact from "lodash/compact";
import { getFormPaths } from "@devographics/templates";

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) =>
      s.questions.map((q) => ({ ...q, section: omit(s, "questions") }))
    )
    .flat();

export const getEditionEntities = (edition: EditionMetadata): Array<Entity> => {
  const editionQuestions = getEditionQuestions(edition);
  const editionOptions = editionQuestions.map((q) => q.options).flat();
  const allEntities = compact([
    ...editionQuestions.map((q) => q?.entity),
    ...editionOptions.map((q) => q?.entity),
  ]) as Entity[];
  return allEntities;
};

export const getInterestedItems = (
  edition: EditionMetadata,
  response: ResponseDocument
) => {
  const allQuestions = getEditionQuestions(edition);
  const readingListQuestions = allQuestions.filter((q) => q.entity);
  const interestedItems = readingListQuestions.filter((question) => {
    const formPaths = getFormPaths({ edition, question });
    const rawExperiencePath = formPaths?.response;
    const rawSentimentPath = formPaths?.sentiment;
    const expValue = rawExperiencePath && response[rawExperiencePath];
    const sentimentValue = rawSentimentPath && response[rawSentimentPath];

    const isInterested =
      [FeaturesOptions.HEARD, FeaturesOptions.NEVER_HEARD].includes(expValue) &&
      [SimplifiedSentimentOptions.POSITIVE_SENTIMENT].includes(sentimentValue);

    return isInterested;
  });
  return interestedItems;
};
