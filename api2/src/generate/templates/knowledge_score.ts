import { TemplateFunction, TransformFunction } from '../types'
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
    data.forEach(year => {
        year.facets.forEach(facet => {
            facet.buckets = range(0, 100 / groupBy).map(n => {
                const selectedBuckets = facet.buckets.filter(
                    b => Number(b.id) >= n * groupBy && Number(b.id) < (n + 1) * groupBy
                )
                return {
                    id: getId(n),
                    count: sumBy(selectedBuckets, 'count'),
                    percentage_survey:
                        Math.round(100 * sumBy(selectedBuckets, 'percentage_survey')) / 100,
                    percentage_question:
                        Math.round(100 * sumBy(selectedBuckets, 'percentage_question')) / 100
                }
            })
        })
    })
    return data
}

export const knowledge_score: TemplateFunction = ({ question, section }) => ({
    id: 'knowledge_score',
    transformFunction
})
