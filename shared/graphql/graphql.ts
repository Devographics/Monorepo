import type { EditionMetadata, SurveyMetadata } from '@devographics/types'
import {
    getSurveysQuery,
    getEditionQuery,
    getEditionQuerySurveyForm,
    getSurveyQuery,
    getLocalesListQuerySurveyForm,
    getLocaleQuerySurveyForm
} from './queries'
import { logToFile } from '@devographics/helpers'

export const getApiUrl = () => {
    const apiUrl = process.env.DATA_API_URL
    if (!apiUrl) {
        throw new Error('process.env.DATA_API_URL not defined, it should point the the API')
    }
    return apiUrl
}

/**
 * If connecting to the local API instance, will also include the demo survey
 * /!\ if you run the production version of the API locally, you may need to reset your Redis cache
 * to get the demo survey back
 * @param param0
 * @returns
 */
export const fetchSurveysListGraphQL = async ({
    includeQuestions
}: {
    includeQuestions?: boolean
}): Promise<Array<SurveyMetadata>> => {
    const query = getSurveysQuery({ includeQuestions })
    await logToFile('fetchSurveysListGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query, queryName: 'fetchSurveysListGraphQL' })
    await logToFile('fetchSurveysListGraphQL.json', result, { mode: 'overwrite' })
    return result._metadata.surveys as SurveyMetadata[]
}

export const fetchEditionGraphQL = async ({
    surveyId,
    editionId
}: {
    surveyId: string
    editionId: string
}): Promise<EditionMetadata> => {
    const query = getEditionQuery({ surveyId, editionId })
    await logToFile('fetchEditionGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query, queryName: 'fetchEditionGraphQL' })
    await logToFile('fetchEditionGraphQL.json', result, { mode: 'overwrite' })
    return result._metadata.surveys[0].editions[0]
}

export const fetchSurveyGraphQL = async ({
    surveyId
}: {
    surveyId: string
}): Promise<SurveyMetadata> => {
    const query = getSurveyQuery({ surveyId })
    await logToFile('fetchSurveyGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query, queryName: 'fetchSurveyGraphQL' })
    await logToFile('fetchSurveyGraphQL.json', result, { mode: 'overwrite' })
    return result[surveyId]._metadata as SurveyMetadata
}

export const fetchEditionGraphQLSurveyForm = async ({
    surveyId,
    editionId
}: {
    surveyId: string
    editionId: string
}): Promise<EditionMetadata> => {
    const query = getEditionQuerySurveyForm({ surveyId, editionId })
    await logToFile('fetchEditionGraphQLSurveyForm.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query, queryName: 'fetchEditionGraphQLSurveyForm' })
    await logToFile('fetchEditionGraphQLSurveyForm.json', result, { mode: 'overwrite' })
    return result._metadata.surveys[0].editions[0]
}

export const fetchLocalesListGraphQL = async ({}: {}): Promise<any> => {
    const query = getLocalesListQuerySurveyForm()
    await logToFile('fetchLocalesListGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({
        query,
        queryName: 'fetchLocalesListGraphQL',
        apiUrl: process.env.INTERNAL_API_URL
    })
    await logToFile('fetchLocalesListGraphQL.json', result, { mode: 'overwrite' })
    return result
}

export const fetchLocaleGraphQL = async ({ localeId }: { localeId: string }): Promise<any> => {
    const query = getLocaleQuerySurveyForm({ localeId })
    const result = await fetchGraphQLApi({
        query,
        queryName: 'fetchLocaleGraphQL',
        apiUrl: process.env.INTERNAL_API_URL
    })
    return result
}

export const fetchGraphQLApi = async ({
    query,
    queryName,
    apiUrl: apiUrl_
}: {
    query: string
    queryName: string
    apiUrl?: string
}): Promise<any> => {
    const apiUrl = apiUrl_ || getApiUrl()
    await logToFile(`${queryName}.gql`, query, { mode: 'overwrite' })

    // console.debug(`// querying ${apiUrl} (${query.slice(0, 15)}...)`)
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: {} }),
        // always get a fresh answer
        cache: 'no-store'
    })
    const json: any = await response.json()
    if (json.errors) {
        console.log('// surveysQuery API query error')
        console.log(JSON.stringify(json.errors, null, 2))
        throw new Error()
    }
    await logToFile(`${queryName}.json`, json.data, { mode: 'overwrite' })

    return json.data
}
