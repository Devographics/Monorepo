import orderBy from 'lodash/orderBy'
import { Db } from 'mongodb'
import config from '../config'
import { SurveyConfig, YearParticipation } from '../types'
import { Filters } from '../filters'

export async function computeParticipationByYear(
    db: Db,
    survey: SurveyConfig,
    filters?: Filters,
    year?: number
): Promise<YearParticipation[]> {
    const collection = db.collection(config.mongo.normalized_collection)

    const participantsByYear = await collection
        .aggregate([
            {
                $match: {
                    survey: survey.survey
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
        .toArray() as YearParticipation[]

    return orderBy(participantsByYear, 'year')
}

export async function getParticipationByYearMap(
    db: Db,
    survey: SurveyConfig
): Promise<{
    [key: number]: number
}> {
    const buckets = await computeParticipationByYear(db, survey)

    return buckets.reduce((acc, bucket) => {
        return {
            ...acc,
            [Number(bucket.year)]: bucket.participants
        }
    }, {})
}
