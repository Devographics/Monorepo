import { ParsedQuestionExt } from '../../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../../generate/helpers'
/*

Sample output:

type DisabilityStatus {
    allEditions: [EditionData]
    edition(editionId: StateOfJsEditionID!): EditionData
    options: [DisabilityStatusOptions]
}

*/

export const generateFieldType = ({ question }: { question: ParsedQuestionExt }) => {
    const { fieldTypeName, optionTypeName, options } = question

    return {
        typeName: fieldTypeName,
        typeType: 'question',
        typeDef: `type ${fieldTypeName} {
    responses(filters: ${getFiltersTypeName(
        question.surveyId
    )}, parameters: Parameters, facet: ${getFacetsTypeName(question.surveyId)}): ${graphqlize(
            question.surveyId
        )}Responses${options ? `\n    options: [${optionTypeName}]` : ''}
}`
    }
}
