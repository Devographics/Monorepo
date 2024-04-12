import { ResponseEditionData, SurveyMetadata } from '@devographics/types'
import { getCollection } from '../../helpers/db'
import { RequestContext } from '../../types'

export const getData = async (db: RequestContext['db'], survey: SurveyMetadata, pipeline: any) => {
    const collection = getCollection(db, survey)
    return (await collection.aggregate(pipeline).toArray()) as ResponseEditionData[]
}
