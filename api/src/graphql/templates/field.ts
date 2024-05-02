import {
    QuestionApiObject,
    SurveyApiObject,
    TypeDefTemplateOutput,
    TypeTypeEnum
} from '../../types'
import { subFields } from '../../generate/subfields'
/*

Sample output:

type StateOfJsDisabilityStatus {
    responses(filters: StateOfJsFilters, parameters: Parameters, facet: StateOfJsFacets): StateOfJsResponses
    options: [StateOfJsDisabilityStatusOption]
}

*/

export const generateFieldType = async ({
    question
}: {
    question: QuestionApiObject
}): Promise<TypeDefTemplateOutput | undefined> => {
    const { fieldTypeName } = question
    // note: we use a for…of loop to avoid issues with async await and returning
    // promises instead of booleans
    const includedSubFields = []
    for (const subField of subFields) {
        const { addIf, addIfAsync } = subField
        const addSubField = addIfAsync ? await addIfAsync(question) : addIf(question)
        if (addSubField) {
            includedSubFields.push(subField)
        }
    }
    if (!fieldTypeName || includedSubFields.length === 0) {
        return
    } else {
        return {
            generatedBy: 'field',
            typeName: fieldTypeName,
            typeType: TypeTypeEnum.FIELD_GENERATED,
            typeDef: `type ${fieldTypeName} {
                ${includedSubFields.map(({ def }) => def(question)).join('\n  ')}
              }`
        }
    }
}

/*

Same as above but generates a generic version which contains all subfields

Useful when merging question data

*/
export const getGenericFieldTypeName = () => `GenericField`

export const generateGenericFieldType = ({
    surveys
}: {
    surveys: SurveyApiObject[]
}): TypeDefTemplateOutput => {
    const fieldTypeName = getGenericFieldTypeName()

    // for the following fields, merging data doesn't make sense
    const disallowedFields = ['_metadata', 'options', 'entity']

    const validSubFields = subFields.filter(f => !disallowedFields.includes(f.id))

    // this will determine which filters, facets, etc. are used for the generic field type
    // just use State of JS as convention since we need to pick one
    const question = { surveyId: 'state_of_js' } as QuestionApiObject

    return {
        generatedBy: 'field',
        typeName: fieldTypeName,
        typeType: TypeTypeEnum.FIELD_GENERATED,
        typeDef: `type ${fieldTypeName} {
                ${validSubFields.map(({ def }) => def(question)).join('\n  ')}
              }`
    }
}
