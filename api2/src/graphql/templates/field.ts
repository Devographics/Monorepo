import { QuestionApiObject } from '../../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../../generate/helpers'
/*

Sample output:

type StateOfJsDisabilityStatus {
    responses(filters: StateOfJsFilters, parameters: Parameters, facet: StateOfJsFacets): StateOfJsResponses
    options: [StateOfJsDisabilityStatusOption]
}

*/

export const generateFieldType = ({ question }: { question: QuestionApiObject }) => {
    const { fieldTypeName, optionTypeName, options } = question

    return {
        typeName: fieldTypeName,
        typeType: 'field_generated',
        typeDef: `type ${fieldTypeName} {
    responses(filters: ${getFiltersTypeName(
        question.surveyId
    )}, parameters: Parameters, facet: ${getFacetsTypeName(question.surveyId)}): ${graphqlize(
            question.surveyId
        )}Responses${options ? `\n    options: [${optionTypeName}]` : ''}
}`
    }
}
