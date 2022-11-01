import {
    getAllSurveysQuery,
    getAllLocalesQuery,
    getAllLocalesMetadataQuery,
    getSingleLocaleQuery
} from '../data/query'

type HomepageData = {
    allSurveys?: any[]
    locales?: any[]
}

export const getSizeInKB = obj => {
    const str = JSON.stringify(obj)
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length
    return Math.round(bytes / 1000)
}
const runQuery = async (url: string, query: string, queryName: string): Promise<any> => {
    const startAt = new Date()
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query
        })
    })
    const text = await response.text()
    const endAt = new Date()
    try {
        const json = JSON.parse(text) // Try to parse it as JSON
        if (json.errors) {
            throw new Error(json.errors[0].message)
        }
        console.log(
            `🕚 Ran query ${queryName} in ${endAt.getTime() - startAt.getTime()}ms (${getSizeInKB(
                json
            )}kb) | ${url}`
        )

        return json.data
    } catch (error) {
        console.log(`// runQuery error (API_URL: ${url})`)
        console.log(text)
        throw new Error(error)
    }
}


export const getData = async (): Promise<HomepageData> => {
    const surveySlug = import.meta.env.SURVEY
    const dataApiUrl = import.meta.env.DATA_API_URL
    const internalApiUrl = import.meta.env.INTERNAL_API_URL
    const fastBuild = import.meta.env.FAST_BUILD === 'true'
    const locales = []
    const allSurveysData = await runQuery(dataApiUrl, getAllSurveysQuery(), 'AllSurveys')

    const allLocalesMetadata = await runQuery(
        internalApiUrl,
        getAllLocalesMetadataQuery(surveySlug),
        'AllLocalesMetadata'
    )
    const localesToUse = fastBuild
        ? allLocalesMetadata.locales.filter(l => ['en-US', 'ru-RU'].includes(l.id))
        : allLocalesMetadata.locales
    for (const locale of localesToUse) {
        const localeWithStrings = await runQuery(
            internalApiUrl,
            getSingleLocaleQuery(locale.id, surveySlug),
            `SingleLocale_${locale.id}`
        )
        locales.push(localeWithStrings.locale)
    }
    const data = { ...allSurveysData, locales }
    return data
}

// export const dataFetcher = {
//     data: {},
//     _init: async function () {
//         const response = await fetch('http://localhost:4000/graphql', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 query: getQuery(import.meta.env.SURVEY)
//             })
//         })

//         const json = await response.json()
//         if (json.errors) {
//             throw new Error(json.errors[0].message)
//         }
//         // const { surveys, locales } = json.data

//         this.data = json.data

//         // json.data.locales.map(locale => ({ params: { localeId: locale.id }, props: { locale, locales, surveys } }))
//     },
//     async getData() {
//         if (!this.data) await this._init()
//         return this.data
//     }
//     // async getLocales() {
//     //   if (!this.cache.locales) await this._init()
//     //   return this.cache.locales;
//     // },
//     // async getSurveys() {
//     //  if (!this.cache.surveys) await this._init()
//     //  return this.cache.surveys
//     // },
//     // async getSurvey(id) {
//     //   if (!this.cache.surveys) await this._init();
//     //   const survey = this.cache.surveys.find(id);
//     // }
// }
