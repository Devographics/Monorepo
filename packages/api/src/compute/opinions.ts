import { Db } from 'mongodb'
import { computeTermAggregationAllYears } from './generic'
import { SurveyConfig } from '../types'
import { Filters } from '../filters'

export async function computeOpinionByYear(
    db: Db,
    survey: SurveyConfig,
    id: string,
    filters?: Filters
) {
    const opinionByYear = await computeTermAggregationAllYears(db, survey, `opinions.${id}`, {
        filters,
        sort: 'id',
        order: 1
    })

    // compute mean for each year
    opinionByYear.forEach((year: any) => {
        const totalScore = year.facets[0].buckets.reduce((acc: any, subBucket: any) => {
            return acc + subBucket.id * subBucket.count
        }, 0)
        year.mean = Math.round((totalScore / year.completion.total) * 10) / 10 + 1
    })

    return opinionByYear
}
