import { knowledge_score as templateFunction } from '@devographics/templates'
import {
    ApiTemplateFunction,
    QuestionApiTemplateOutput,
    TransformFunction
} from '../../types/surveys'
import range from 'lodash/range.js'
import sumBy from 'lodash/sumBy.js'

const groupBy = 10

const getBounds = (n: number) => [n === 0 ? 0 : n * groupBy + 1, (n + 1) * groupBy]

const getId = (n: number) => `range_${getBounds(n)[0]}_${getBounds(n)[1]}`

/*

Group results into 10% buckets

*/
export const transformFunction: TransformFunction = (
    { survey, edition, section, question },
    data,
    context
) => {
    data.forEach(editionData => {
        console.log('// editionData.buckets')
        console.log(editionData.buckets)
        const groupedBuckets = range(0, 100 / groupBy).map(n => {
            const [lowerBound, upperBound] = getBounds(n)
            const selectedBuckets = editionData.buckets.filter(
                b => Number(b.id) >= lowerBound && Number(b.id) <= upperBound
            )
            const bucket = {
                id: getId(n),
                count: sumBy(selectedBuckets, 'count'),
                percentageSurvey:
                    Math.round(100 * sumBy(selectedBuckets, 'percentageSurvey')) / 100,
                percentageQuestion:
                    Math.round(100 * sumBy(selectedBuckets, 'percentageQuestion')) / 100,
                facetBuckets: []
            }

            return bucket
        })
        editionData.buckets = groupedBuckets
    })
    return data
}

export const knowledge_score: ApiTemplateFunction = options => {
    const { question, section } = options
    const output: QuestionApiTemplateOutput = {
        ...templateFunction(options),
        transformFunction
    }
    return output
}
