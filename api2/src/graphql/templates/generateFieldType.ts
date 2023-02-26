import { ParsedQuestion } from '../../generate/types'
import { getFiltersTypeName, getFacetsTypeName } from '../../generate/helpers'
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
    )}, parameters: Parameters, facet: ${getFacetsTypeName(question.surveyId)}): Responses${
            options ? `\n    options: [${optionTypeName}]` : ''
        }
}`
    }
}
