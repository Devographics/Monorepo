import { EditionApiObject, RequestContext, SectionApiObject, SurveyApiObject } from '../types'
import { getSectionItems } from '../generate/helpers'
import { FeaturesOptions } from '@devographics/types'
import { COUNT, PERCENTAGE_SURVEY } from '@devographics/constants'
import { getNormResponsesCollection } from '@devographics/mongo'
import { genericComputeFunction } from './generic'
import { getEntity } from '../load/entities'

export const getCardinalities = async ({
    survey,
    edition,
    section,
    type,
    context
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    type: 'tools' | 'features'
    context: RequestContext
}) => {
    const cardinalities = [
        {
            id: `${FeaturesOptions.HEARD}`,
            normPaths: { response: `_cardinalities.${section.id}.${FeaturesOptions.HEARD}` }
        },
        {
            id: `${FeaturesOptions.USED}`,
            normPaths: { response: `_cardinalities.${section.id}.${FeaturesOptions.USED}` }
        }
    ]
    return cardinalities.map(async cardinality => {
        return {
            survey,
            edition,
            section,
            question: cardinality
        }
    })
}
