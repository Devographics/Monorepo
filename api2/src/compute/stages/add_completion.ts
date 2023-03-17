import { EditionData, EditionParticipation } from '../../types'
import { ratioToPercentage } from '../common'
import { CompletionResult } from '../completion'
import sumBy from 'lodash/sumBy.js'

// add completion counts for each year and facet
export async function addCompletionCounts(
    resultsByEdition: EditionData[],
    totalRespondentsByYear: EditionParticipation[],
    completionByYear: CompletionResult[]
) {
    for (let editionData of resultsByEdition) {
        const totalRespondents =
            totalRespondentsByYear.find(e => e.editionId === editionData.editionId)?.total ?? 0
        const questionRespondents =
            completionByYear.find(e => e.editionId === editionData.editionId)?.total ?? 0

        editionData.completion = {
            total: totalRespondents,
            count: questionRespondents,
            percentageSurvey: ratioToPercentage(questionRespondents / totalRespondents)
        }
        // TODO: this is probably not needed anymore?
        // for (let bucket of editionData.buckets) {
        //     // TODO: not accurate because it doesn't account for
        //     // respondents who didn't answer the question
        //     const count = bucket.facetBuckets ? sumBy(bucket.facetBuckets, 'count') : bucket.count
        //     bucket.completion = {
        //         total: totalRespondents,
        //         count,
        //         percentageQuestion: ratioToPercentage(count / questionRespondents),
        //         percentageSurvey: ratioToPercentage(count / totalRespondents)
        //     }
        // }
    }
}
