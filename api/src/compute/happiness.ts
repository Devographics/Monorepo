import { Db } from 'mongodb'
import { computeTermAggregationAllYears } from './generic'
import { RequestContext, SurveyConfig } from '../types'
import { Filters } from '../filters'

export async function computeHappinessByYear({
    context,
    survey,
    id,
    filters
}: {
    context: RequestContext
    survey: SurveyConfig
    id: string
    filters?: Filters
}) {
    const happinessByYear = await computeTermAggregationAllYears({
        context,
        survey,
        key: `happiness.${id}`,
        options: {
            filters,
            sort: { property: 'id', order: 'asc' }
        }
    })

    // compute mean for each year
    happinessByYear.forEach((year: any) => {
        const totalScore = year.facets[0].buckets.reduce((acc: any, subBucket: any) => {
            return acc + subBucket.id * subBucket.count
        }, 0)
        year.mean = Math.round((totalScore / year.completion.total) * 10) / 10 + 1
    })
    return happinessByYear
}
