/**
 * Fetch all surveys + their editions from the Devographics API at build time
 *
 * We call the GraphQL API directly (without the Redis caching layer used by
 * other apps) since this page is static and only queries it once per build
 */
import { getLocaleQuery, getSurveysQuery, graphqlFetcher } from '@devographics/fetch'
import {
    type EditionMetadata,
    ResultsStatusEnum,
    type SurveyMetadata,
    SurveyStatusEnum
} from '@devographics/types'

const API_URL = import.meta.env.API_URL || 'https://api.devographics.com/graphql'

async function query<T>(q: string) {
    const { data, errors } = await graphqlFetcher<T>(q, {}, {}, API_URL)
    if (errors?.length || !data) {
        throw new Error(`Devographics API error: ${JSON.stringify(errors)}`)
    }
    return data
}

export type EditionStatus = 'open' | 'preview' | 'results' | 'closed'

export interface Edition
    extends Pick<
        EditionMetadata,
        'id' | 'year' | 'questionsUrl' | 'resultsUrl' | 'startedAt' | 'endedAt' | 'colors'
    > {
    status: EditionStatus
    surveyId: string
    surveyName: string
}

export interface Survey extends Pick<SurveyMetadata, 'id' | 'name' | 'domain'> {
    description?: string
    editions: Edition[]
    latest: Edition
}

const getEditionStatus = (edition: EditionMetadata): EditionStatus => {
    if (edition.status === SurveyStatusEnum.OPEN) return 'open'
    if (edition.status === SurveyStatusEnum.PREVIEW) return 'preview'
    if (edition.resultsStatus === ResultsStatusEnum.PUBLISHED) return 'results'
    return 'closed'
}

const time = (date?: string) => (date ? new Date(date).getTime() : 0)

export const getData = async () => {
    const { _metadata } = await query<{ _metadata: { surveys: SurveyMetadata[] } }>(
        getSurveysQuery({ addCredits: false })
    )
    const allSurveys = _metadata.surveys.filter(s => !s.isDemo)

    // survey descriptions ("general.state_of_js.description") live in the locale strings
    const { locale } = await query<{
        locale: { strings: Array<{ key: string; t: string }> }
    }>(getLocaleQuery({ localeId: 'en-US', contexts: allSurveys.map(s => s.id) }))
    const strings = Object.fromEntries(locale.strings.map(({ key, t }) => [key, t]))

    const surveys: Survey[] = allSurveys
        .map(survey => {
            const editions = (survey.editions || [])
                .filter(e => e.status !== SurveyStatusEnum.HIDDEN)
                .map(e => ({
                    id: e.id,
                    year: e.year,
                    questionsUrl: e.questionsUrl,
                    resultsUrl: e.resultsUrl,
                    startedAt: e.startedAt,
                    endedAt: e.endedAt,
                    colors: e.colors,
                    status: getEditionStatus(e),
                    surveyId: survey.id,
                    surveyName: survey.name
                }))
                .sort((a, b) => b.year - a.year)
            return {
                id: survey.id,
                name: survey.name,
                domain: survey.domain,
                description: strings[`general.${survey.id}.description`],
                editions,
                latest: editions[0]
            }
        })
        .filter(s => s.latest)
        // most recently active surveys first
        .sort((a, b) => time(b.latest.endedAt) - time(a.latest.endedAt))

    const editions = surveys
        .flatMap(s => s.editions)
        .sort((a, b) => time(b.startedAt) - time(a.startedAt))

    return {
        surveys,
        editions,
        openEditions: editions.filter(e => e.status === 'open'),
        firstYear: Math.min(...editions.map(e => e.year))
    }
}
