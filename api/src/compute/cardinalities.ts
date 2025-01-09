import {
    EditionApiObject,
    QuestionApiObject,
    RequestContext,
    SectionApiObject,
    SurveyApiObject
} from '../types'
import { FeaturesOptions } from '@devographics/types'

export const getCardinalities = async ({
    survey,
    edition,
    section,
    questionObjects,
    type,
    context
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    questionObjects: QuestionApiObject[]
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
            question: cardinality,
            questionObjects
        }
    })
}
