import { computeParticipationByYear } from './demographics'
import { YearCompletion, Survey, RequestContext } from '../types'

/**
 * Convert a ratio to percentage, applying a predefined rounding.
 */
export const ratioToPercentage = (ratio: number) => {
    return Math.ceil(ratio * 1000) / 10
}

/**
 * Compute completion percentage.
 */
export const computeCompletion = (answerCount: number, totalCount: number) => {
    return ratioToPercentage(answerCount / totalCount)
}

/**
 * Add completion information for yearly buckets.
 */
export const appendCompletionToYearlyResults = async <
    T extends { year: number; total: number; completion: Pick<YearCompletion, 'count'> }
>(
    context: RequestContext,
    survey: Survey,
    yearlyResults: T[]
): Promise<Array<Omit<T, 'completion'> & { completion: YearCompletion }>> => {
    const totalRespondentsByYear = await computeParticipationByYear({ context, survey })

    return yearlyResults.map(yearlyResult => {
        return {
            ...yearlyResult,
            completion: {
                total: totalRespondentsByYear.find(e => e.editionId === yearlyResult.id)?.count,
                count: yearlyResult.completion.count,
                percentageSurvey: ratioToPercentage(
                    yearlyResult.completion.count / totalRespondentsByYear[yearlyResult.year]
                )
            }
        } as Omit<T, 'completion'> & { completion: YearCompletion }
    })
}
