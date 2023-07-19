type CacheKeyOptions = {
  appName?: string;
};

const getAppName = (options) => options.appName || process.env.APP_NAME;

export const editionMetadataCacheKey = (
  options: CacheKeyOptions & {
    surveyId: string;
    editionId: string;
  }
) =>
  `${getAppName(options)}__${options.surveyId}__${options.editionId}__metadata`;

export const surveysMetadataCacheKey = (options?: CacheKeyOptions) =>
  `${getAppName(options)}__allSurveys__metadata`;

export const surveyMetadataCacheKey = (
  options: CacheKeyOptions & {
    surveyId: string;
  }
) => `${getAppName(options)}__${options.surveyId}__metadata`;

export const allLocalesMetadataCacheKey = (options?: CacheKeyOptions) =>
  `${getAppName(options)}__allLocales`;

export const allLocalesIdsCacheKey = (options?: CacheKeyOptions) =>
  `${getAppName(options)}__allLocalesIds`;

export const localeCacheKey = (
  options: CacheKeyOptions & {
    localeId: string;
    contexts: string[];
  }
) =>
  `${getAppName(options)}__${options.localeId}__${options.contexts.join("_")}`;

export const allEntitiesCacheKey = (options?: CacheKeyOptions) =>
  `${getAppName(options)}__allEntities`;
