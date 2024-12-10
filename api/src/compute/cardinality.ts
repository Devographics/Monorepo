import { EditionApiObject, RequestContext, SectionApiObject, SurveyApiObject } from '../types'
import { getSectionItems } from '../generate/helpers'
import { FeaturesOptions } from '@devographics/types'
import { COUNT, PERCENTAGE_SURVEY } from '@devographics/constants'
import { getNormResponsesCollection } from '@devographics/mongo'

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
    const cardinalities = []
    const items = getSectionItems(section, type)
    // const normalizedResponses = await getNormResponsesCollection(survey)

    for (let n = 0; n <= items.length; n++) {
        // TODO
        const heardCount = 3000
        const usedCount = 2000
        const heardPercentage = 50
        const usedPercentage = 30
        const cardinality = {
            n,
            [`${FeaturesOptions.HEARD}_${COUNT}`]: heardCount,
            [`${FeaturesOptions.USED}_${COUNT}`]: usedCount,
            [`${FeaturesOptions.HEARD}_${PERCENTAGE_SURVEY}`]: heardPercentage,
            [`${FeaturesOptions.USED}_${PERCENTAGE_SURVEY}`]: usedPercentage
        }
        cardinalities.push(cardinality)
    }
    return cardinalities
}
