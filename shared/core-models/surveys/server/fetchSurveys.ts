// /**
//  * 1) get from in-memory cache if available (short TTL because it can't be emptied)
//  * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
//  * 3) get from Github in last resort
//  */
// import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from '../typings'
// import NodeCache from 'node-cache'
// import { fetchSurveyContextGithub, fetchSurveyGithub, fetchSurveysListGithub } from './fetchGithub'
// import {
//     fetchSurveyContextRedis,
//     fetchEditionRedis,
//     fetchSurveysListRedis,
//     storeSurveyContextRedis,
//     storeSurveyRedis,
//     storeSurveysListRedis
// } from '@devographics/redis'
// import orderBy from 'lodash/orderBy.js'
// import { MetadataPackage, SurveyMetadata, EditionMetadata } from '@devographics/types'

// import { fetchEditionGraphQLSurveyForm, fetchSurveysListGraphQL } from '@devographics/graphql'

// const surveysCache = new NodeCache({
//     // This TTL must stay short, because we manually invalidate this cache
//     stdTTL: 5 * 60, // in seconds
//     // needed for caching promises
//     useClones: false
// })

// async function fromSurveysCache<T = any>(key: string, fetchFunc: () => Promise<T>) {
//     if (surveysCache.has(key)) {
//         console.debug('in-memory cache hit', key)
//         const res = await surveysCache.get<Promise<T>>(key)!
//         return res
//     }
//     console.debug('in-memory cache miss', key)
//     const promise = fetchFunc()
//     surveysCache.set(key, promise)
//     return await promise
// }

// export async function fetchEditionMetadata({
//     surveyId,
//     editionId
// }: {
//     surveyId: string
//     editionId: string
// }): Promise<EditionMetadata> {
//     const key = `survey_${surveyId}_promise`
//     return await fromSurveysCache(key, async () => {
//         const redisSurvey = await fetchEditionRedis({ surveyId, editionId })
//         if (redisSurvey) {
//             console.debug('redis cache hit', surveyId, editionId)
//             return redisSurvey
//         }
//         console.debug('redis cache miss,', surveyId, editionId, 'fetching from github')
//         const graphqlSurvey = await fetchEditionGraphQLSurveyForm({ surveyId, editionId })
//         // store in Redis in the background
//         storeSurveyRedis({
//             surveyId,
//             editionId
//         })(graphqlSurvey).catch(err => {
//             console.error("couldn't store survey in Redis", err)
//         })
//         return graphqlSurvey
//     })
// }

// export const fetchSurveysMetadata = async ({
//     keepDemo
// }: {
//     keepDemo?: boolean
// }): Promise<Array<SurveyMetadata>> => {
//     const key = 'surveys_description_list'
//     let surveys = await fromSurveysCache(key, async () => {
//         const redisSurveys = await fetchSurveysListRedis()
//         if (redisSurveys) {
//             return redisSurveys
//         }
//         const graphqlSurveys = await fetchSurveysListGraphQL({ includeQuestions: false })
//         storeSurveysListRedis(graphqlSurveys)
//         return graphqlSurveys
//     })
//     // NOTE: we cannot systematically override "NODE_ENV" with test,
//     // so we have to use a custom node_env variable NEXT_PUBLIC_NODE_ENV
//     console.log('ENV', process.env.NODE_ENV, process.env.NEXT_PUBLIC_NODE_ENV)
//     if (!keepDemo) {
//         surveys = surveys.filter(s => s.id !== 'demo_survey')
//     }
//     const sorted = orderBy(surveys, ['year', 'surveyId'], ['desc', 'asc'])
//     return sorted
// }

// // export async function fetchEditionPackageFromId({
// //     editionId,
// //     apiUrl
// // }: {
// //     editionId: string
// //     apiUrl: string
// // }): Promise<MetadataPackage> {
// //     // no need to cache this functions,
// //     // because it is derived from other functions that are themselves cached
// //     // (always get demo survey here, we filter afterward)
// //     const surveyList = await fetchSurveysMetadata({ keepDemo: true, apiUrl })
// //     const survey = surveyList.find(s => s.editions.some(e => e.id === editionId))
// //     if (!survey) {
// //         throw new Error(`No survey with surveyId ${editionId}`)
// //     }
// //     const edition = await fetchEditionMetadata({ surveyId: survey.id, editionId, apiUrl })
// //     return { survey, edition }
// // }

// export async function fetchSurveyContext(
//     surveyId: SurveySharedContext['id']
// ): Promise<SurveySharedContext> {
//     const key = `survey_context_${surveyId}`
//     return await fromSurveysCache(key, async () => {
//         const redisSurvey = await fetchSurveyContextRedis(surveyId)
//         if (redisSurvey) {
//             return redisSurvey
//         }
//         const ghSurvey = await fetchSurveyContextGithub(surveyId)
//         storeSurveyContextRedis(surveyId)(ghSurvey)
//         return ghSurvey
//     })
// }
