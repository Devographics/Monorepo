export const editionMetadataCacheKey = ({
    appName,
    surveyId,
    editionId
}: {
    appName: string
    surveyId: string
    editionId: string
}) => `${appName}__${surveyId}__${editionId}__metadata`

export const surveysMetadataCacheKey = ({ appName }: { appName: string }) =>
    `${appName}__allSurveys__metadata`

export const surveyMetadataCacheKey = ({
    appName,
    surveyId
}: {
    appName: string
    surveyId: string
}) => `${appName}__${surveyId}__metadata`

export const allLocalesMetadataCacheKey = ({ appName }: { appName: string }) =>
    `${appName}__allLocales`

export const allLocalesIdsCacheKey = ({ appName }: { appName: string }) =>
    `${appName}__allLocalesIds`

export const localeCacheKey = ({
    appName,
    localeId,
    contexts
}: {
    appName: string
    localeId: string
    contexts: string[]
}) => `${appName}__${localeId}__${contexts.join('_')}`
