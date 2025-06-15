import { ResponseEditionData, EditionParticipation } from '../../types'
import { ratioToPercentage } from '../common'
import { CompletionResult } from '../completion'
import sumBy from 'lodash/sumBy.js'

// add completion counts for each year and facet
export async function addCompletionCounts(
    resultsByEdition: ResponseEditionData[],
    totalRespondentsByYear: EditionParticipation[],
    completionByYear: CompletionResult[]
) {
    for (let editionData of resultsByEdition) {
        const surveyCompletion = totalRespondentsByYear.find(
            e => e.editionId === editionData.editionId
        )
        const questionCompletion = completionByYear.find(e => e.editionId === editionData.editionId)

        const totalSurveyRespondents = surveyCompletion?.total ?? 0
        const totalQuestionRespondents = questionCompletion?.totalRespondents ?? 0
        const totalAnswers = questionCompletion?.totalAnswers ?? 0

        editionData.completion = {
            // number of survey respondents
            total: totalSurveyRespondents,
            // number of respondents that match filters
            filteredTotal: 999, // todo
            // number of question respondents
            count: totalQuestionRespondents,
            // number of question answers
            answersCount: totalAnswers,
            percentageSurvey: ratioToPercentage(totalQuestionRespondents / totalSurveyRespondents)
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
