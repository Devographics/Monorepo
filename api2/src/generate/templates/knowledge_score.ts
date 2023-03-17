import { TemplateFunction, TransformFunction } from '../../types/surveys'
import range from 'lodash/range.js'
import sumBy from 'lodash/sumBy.js'

const groupBy = 10

const getId = (n: number) => `${n * groupBy}-${(n + 1) * groupBy}%`

/*

Group results into 10% buckets

*/
const transformFunction: TransformFunction = (
    { survey, edition, section, question },
    data,
    context
) => {
    data.forEach(editionData => {
        editionData.buckets = range(0, 100 / groupBy).map(n => {
            const selectedBuckets = editionData.buckets.filter(
                b => Number(b.id) >= n * groupBy && Number(b.id) < (n + 1) * groupBy
            )
            return {
                id: getId(n),
                count: sumBy(selectedBuckets, 'count'),
                percentageSurvey:
                    Math.round(100 * sumBy(selectedBuckets, 'percentageSurvey')) / 100,
                percentageQuestion:
                    Math.round(100 * sumBy(selectedBuckets, 'percentageQuestion')) / 100,
                facetBuckets: []
            }
        })
    })
    return data
}

export const knowledge_score: TemplateFunction = ({ question, section }) => ({
    ...question,
    id: 'knowledge_score',
    dbPath: 'user_info.knowledge_score',
    transformFunction
})
