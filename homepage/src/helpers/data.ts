import { fetchAllLocalesMetadata, fetchSurveysMetadata, fetchLocale } from '@devographics/fetch'
import { getConfig } from '@devographics/helpers'
import { SurveyStatusEnum } from '@devographics/types'

type HomepageData = {
    allSurveys?: any[]
    locales?: any[]
}

export const getData = async (): Promise<HomepageData> => {
    process.env.APP_NAME = import.meta.env.APP_NAME
    process.env.API_URL = import.meta.env.API_URL
    process.env.SURVEYID = import.meta.env.SURVEYID
    process.env.FAST_BUILD = import.meta.env.FAST_BUILD
    process.env.REDIS_UPSTASH_URL = import.meta.env.REDIS_UPSTASH_URL
    process.env.REDIS_TOKEN = import.meta.env.REDIS_TOKEN
    process.env.LOGS_PATH = import.meta.env.LOGS_PATH

    const config = getConfig({ showWarnings: true })

    const surveyId = import.meta.env.SURVEYID
    const fastBuild = import.meta.env.FAST_BUILD === 'true'
    const locales = []
    const options = {
        shouldGetFromCache: false,
        redisUrl: import.meta.env.REDIS_UPSTASH_URL,
        redisToken: import.meta.env.REDIS_TOKEN
    }
    const { data: allSurveysData } = await fetchSurveysMetadata(options)

    const { data: allLocalesMetadata } = await fetchAllLocalesMetadata(options)

    const localesToUse = fastBuild
        ? allLocalesMetadata.filter(l => ['en-US', 'ru-RU'].includes(l.id))
        : allLocalesMetadata
    for (const locale of localesToUse) {
        const { data: localeWithStrings } = await fetchLocale({
            ...options,
            localeId: locale.id,
            contexts: ['homepage', surveyId]
        })

        locales.push(localeWithStrings)
    }
    const allSurveys = (allSurveysData || [])
        // remove surveys with no open/closed edition (new preview surveys, hidden surveys)
        .filter(s => s.editions.some(e => [SurveyStatusEnum.OPEN, SurveyStatusEnum.CLOSED].includes(e.status)))
    const data = { allSurveys, locales }
    return data
}
