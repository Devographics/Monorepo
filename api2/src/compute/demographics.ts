import orderBy from 'lodash/orderBy.js'
import config from '../config'
import { RequestContext, SurveyConfig, YearParticipation } from '../types'
import { Filters } from '../filters'

export async function computeParticipationByYear({
    context,
    survey,
    filters,
    year
}: {
    context: RequestContext
    survey: SurveyConfig
    filters?: Filters
    year?: number
}): Promise<YearParticipation[]> {
    const { db } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const participantsByYear = (await collection
        .aggregate([
            {
                $match: {
                    survey: survey.id
                }
            },
            {
                $group: {
                    _id: { year: '$year' },
                    participants: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    participants: 1
                }
            }
        ])
        .toArray()) as YearParticipation[]

    return orderBy(participantsByYear, 'year')
}

export async function getParticipationByYearMap(
    context: RequestContext,
    survey: SurveyConfig
): Promise<{
    [key: number]: number
}> {
    const buckets = await computeParticipationByYear({ context, survey })
    return buckets.reduce((acc, bucket) => {
        return {
            ...acc,
            [Number(bucket.year)]: bucket.participants
        }
    }, {})
}
