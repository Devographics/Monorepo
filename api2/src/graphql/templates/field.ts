import { ParsedQuestion } from '../../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../../generate/helpers'
/*

Sample output:

type DisabilityStatus {
    all_years: [YearData]
    year(year: Int!): YearData
    options: [DisabilityStatusOptions]
}

*/

export const generateFieldType = ({ question }: { question: ParsedQuestion }) => {
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
