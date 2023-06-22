export const SURVEY_ADMIN_CONTEXT = "surveyadmin";

export const editionMetadataCacheKey = ({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) => `${SURVEY_ADMIN_CONTEXT}__${surveyId}__${editionId}__metadata`;

export const surveysMetadataCacheKey = () =>
  `${SURVEY_ADMIN_CONTEXT}__allSurveys__metadata`;

export const surveyMetadataCacheKey = ({ surveyId }: { surveyId: string }) =>
  `${SURVEY_ADMIN_CONTEXT}__${surveyId}__metadata`;

export const allLocalesMetadataCacheKey = () =>
  `${SURVEY_ADMIN_CONTEXT}__allLocales`;

export const localeCacheKey = ({
  localeId,
  contexts,
}: {
  localeId: string;
  contexts: string[];
}) => `${SURVEY_ADMIN_CONTEXT}__${localeId}__${contexts.join("_")}`;

export const allEntitiesCacheKey = () => `${SURVEY_ADMIN_CONTEXT}__allEntities`;
