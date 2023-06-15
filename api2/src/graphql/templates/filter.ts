import { QuestionApiObject } from '../../types/surveys'

/*

Sample output:

input DisabilityStatusFilter {
    eq: DisabilityStatusID
    in: [DisabilityStatusID]
    nin: [DisabilityStatusID]
}

*/

export const generateFilterType = ({ question }: { question: QuestionApiObject }) => {
    const { filterTypeName, enumTypeName } = question
    if (!filterTypeName) return
    return {
        typeName: filterTypeName,
        typeType: 'filter',
        surveyId: question.surveyId,
        questionId: question.id,
        typeDef: `input ${filterTypeName} {
    eq: ${enumTypeName}
    in: [${enumTypeName}]
    nin: [${enumTypeName}]
}`
    }
}
