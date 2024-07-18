import { ResponseEditionData, SurveyMetadata } from '@devographics/types'
import { getCollection } from '../../helpers/db'
import { RequestContext } from '../../types'

export const getData = async (db: RequestContext['db'], survey: SurveyMetadata, pipeline: any) => {
    const collection = getCollection(db, survey)
    const results = await collection.aggregate(pipeline).toArray()
    return results as ResponseEditionData[]
}
