import { fetchAllLocalesMetadata, fetchSurveysMetadata, fetchLocale } from '@devographics/fetch'
import { getConfig } from '@devographics/helpers'

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
    console.log('// config')
    console.log(config)

    const surveyId = import.meta.env.SURVEYID
    const fastBuild = import.meta.env.FAST_BUILD === 'true'
    const locales = []
    const { data: allSurveysData } = await fetchSurveysMetadata({ shouldGetFromCache: false })
    const { data: allLocalesMetadata } = await fetchAllLocalesMetadata({
        shouldGetFromCache: false
    })

    const localesToUse = fastBuild
        ? allLocalesMetadata.filter(l => ['en-US', 'ru-RU'].includes(l.id))
        : allLocalesMetadata
    for (const locale of localesToUse) {
        const { data: localeWithStrings } = await fetchLocale({
            localeId: locale.id,
            contexts: ['homepage', surveyId],
            shouldGetFromCache: false
        })

        locales.push(localeWithStrings)
    }
    // filter out the demo survey
    const allSurveys = allSurveysData?.filter(s => s.id !== 'demo_survey') || []
    const data = { allSurveys, locales }
    return data
}
