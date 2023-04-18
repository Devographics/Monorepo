import { ApiTemplateFunction, TransformFunction } from '../../types/surveys'
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
        editionData.buckets = range(0, 100 / groupBy).map(n => {
            const [lowerBound, upperBound] = getBounds(n)
            const selectedBuckets = editionData.buckets.filter(
                b => Number(b.id) >= lowerBound && Number(b.id) < upperBound
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
    })
    return data
}

export const getOptions = () =>
    range(0, 100 / groupBy).map(n => ({
        id: getId(n),
        average: n * groupBy + groupBy / 2
    }))

export const knowledge_score: ApiTemplateFunction = options => {
    const { question, section } = options
    return {
        id: 'knowledge_score',
        // dbPath: 'user_info.knowledge_score',
        options: getOptions(),
        transformFunction,
        normPaths: {
            response: 'user_info.knowledge_score'
        },
        ...question
    }
}
