import orderBy from 'lodash/orderBy.js'
import config from '../config'
import { RequestContext, EditionParticipation } from '../types'
import { Survey } from '../types/surveys'
import { inspect } from 'util'
import { getCollection } from '../helpers/db'

export async function computeParticipationByYear({
    context,
    survey
}: {
    context: RequestContext
    survey: Survey
}): Promise<EditionParticipation[]> {
    const { db } = context
    const collection = getCollection(db, survey)

    const aggregationPipeline = [
        {
            $match: {
                // In older surveys it was "survey" rather than "surveyId"
                // don't forget to add an index on "surveyId" in normalized_response collection
                surveyId: survey.id
            }
        },
        {
            $group: {
                _id: { editionId: '$editionId' },
                total: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                editionId: '$_id.editionId',
                total: 1
            }
        }
    ]
    const participantsByYear = (await collection
        .aggregate(aggregationPipeline)
        .toArray()) as EditionParticipation[]

    const results = orderBy(participantsByYear, 'year')

    // console.log('// computeParticipationByYear')
    // console.log(
    //     inspect(
    //         {
    //             aggregationPipeline,
    //             results
    //         },
    //         { colors: true, depth: null }
    //     )
    // )

    return results
}
