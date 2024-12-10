/**
 * We have to centralize cache key in this file,
 * even if they are specific to an app or use case
 * in order to avoid circular dependencies with more specific packages like "@devographics/i18n"
 *
 * TODO: define if @devographics/fetch should be a utility library used by others (i18n etc.)
 * or a centralization libs that uses others libs (to handle cache etc.)
 */

type CacheKeyOptions = {
    appName?: string
}

const getAppName = (options?: { appName?: string }) => options?.appName || process.env.APP_NAME

/** Will dedupe and sort contexts to get a unique key */
export const localeWithStringsCacheKey = (
    options: CacheKeyOptions & { localeId: string; contexts: Array<string> }
) =>
    `${getAppName(options)}_localeWithStrings_${options.localeId}_${[
        ...new Set(options.contexts).values()
    ]
        .sort()
        .join(',')}`

export const editionMetadataCacheKey = (
    options: CacheKeyOptions & {
        surveyId: string
        editionId: string
    }
) => `${getAppName(options)}__${options.surveyId}__${options.editionId}__metadata`

export const editionSitemapCacheKey = (
    options: CacheKeyOptions & {
        surveyId: string
        editionId: string
    }
) => `${getAppName(options)}__${options.surveyId}__${options.editionId}__sitemap`

export const surveysMetadataCacheKey = (options?: CacheKeyOptions) =>
    `${getAppName(options)}__allSurveys__metadata`

export const generalMetadataCacheKey = (options?: CacheKeyOptions) =>
    `${getAppName(options)}__general__metadata`

export const surveyMetadataCacheKey = (
    options: CacheKeyOptions & {
        surveyId: string
    }
) => `${getAppName(options)}__${options.surveyId}__metadata`

export const allLocalesMetadataCacheKey = (options?: CacheKeyOptions) =>
    `${getAppName(options)}__allLocales`

export const allLocalesIdsCacheKey = (options?: CacheKeyOptions) =>
    `${getAppName(options)}__allLocalesIds`

export const allEntitiesCacheKey = (options?: CacheKeyOptions) =>
    `${getAppName(options)}__allEntities`

// TODO: harmonize that with cache keys used by API
export const questionDataCacheKey = (
    options: CacheKeyOptions & {
        surveyId: string
        editionId: string
        sectionId: string
        questionId: string
    }
) =>
    `${getAppName(options)}__${options.surveyId}__${options.editionId}__${options.sectionId}__${
        options.questionId
    }__questionData`
