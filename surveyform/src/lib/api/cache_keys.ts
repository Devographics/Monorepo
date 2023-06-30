export const SURVEY_FORM_CONTEXT = "surveyform";

export const editionMetadataCacheKey = ({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) => `${SURVEY_FORM_CONTEXT}__${surveyId}__${editionId}__metadata`;

export const surveysMetadataCacheKey = () =>
  `${SURVEY_FORM_CONTEXT}__allSurveys__metadata`;

export const surveyMetadataCacheKey = ({ surveyId }: { surveyId: string }) =>
  `${SURVEY_FORM_CONTEXT}__${surveyId}__metadata`;

export const allLocalesMetadataCacheKey = () =>
  `${SURVEY_FORM_CONTEXT}__allLocales`;

export const allLocalesIds = () =>
  `${SURVEY_FORM_CONTEXT}__allLocalesIds`;

export const localeCacheKey = ({
  localeId,
  contexts,
}: {
  localeId: string;
  contexts: string[];
}) => `${SURVEY_FORM_CONTEXT}__${localeId}__${contexts.join("_")}`;
