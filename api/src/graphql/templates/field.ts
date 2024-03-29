import { QuestionApiObject, TypeDefTemplateOutput, TypeTypeEnum } from '../../types'
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
