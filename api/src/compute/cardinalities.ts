import { CARDINALITIES_ID } from '@devographics/constants'
import {
    EditionApiObject,
    QuestionApiObject,
    RequestContext,
    SectionApiObject,
    SurveyApiObject
} from '../types'
import { ApiSectionTypes, FeaturesOptions } from '@devographics/types'

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
    type: ApiSectionTypes
    context: RequestContext
}) => {
    const cardinalities = [
        {
            id: `${FeaturesOptions.HEARD}`,
            normPaths: { response: `${CARDINALITIES_ID}.${section.id}.${FeaturesOptions.HEARD}` },
            optionsAreNumeric: true
        },
        {
            id: `${FeaturesOptions.USED}`,
            normPaths: { response: `${CARDINALITIES_ID}.${section.id}.${FeaturesOptions.USED}` },
            optionsAreNumeric: true
        }
    ]
    const result = cardinalities.map(cardinality => {
        return {
            survey,
            edition,
            section,
            question: cardinality,
            questionObjects
        }
    })
    return result
}
