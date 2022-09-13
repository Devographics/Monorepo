import { getAllSurveysQuery, getAllLocalesQuery } from '../data/query'

type HomepageData = {
    allSurveys?: any[]
    locales?: any[]
}

export const getData = async (): Promise<HomepageData> => {
    let data = {}
    const requests = [
        { url: import.meta.env.DATA_API_URL, query: getAllSurveysQuery() },
        { url: import.meta.env.INTERNAL_API_URL, query: getAllLocalesQuery(import.meta.env.SURVEY) }
    ]
    for (const r of requests) {
        const { url, query } = r
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query
            })
        })
        const text = await response.text()

        try {
            const json = JSON.parse(text) // Try to parse it as JSON
            if (json.errors) {
                throw new Error(json.errors[0].message)
            }
            data = { ...data, ...json.data }
        } catch (error) {
            console.log(`// getData error (API_URL: ${import.meta.env.DATA_API_URL})`)
            console.log(text)
            throw new Error(error)
        }
    }
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
