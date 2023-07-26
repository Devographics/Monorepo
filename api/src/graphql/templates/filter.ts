import { QuestionApiObject, TypeDefTemplateOutput, TypeTypeEnum } from '../../types'

/*

Sample output:

input DisabilityStatusFilter {
    eq: DisabilityStatusID
    in: [DisabilityStatusID]
    nin: [DisabilityStatusID]
}

*/

export const generateFilterType = ({
    question
}: {
    question: QuestionApiObject
}): TypeDefTemplateOutput | undefined => {
    const { filterTypeName, enumTypeName } = question
    if (!filterTypeName) return
    return {
        generatedBy: 'filter',
        typeName: filterTypeName,
        typeType: TypeTypeEnum.FILTER,
        surveyId: question.surveyId,
        questionId: question.id,
        typeDef: `input ${filterTypeName} {
    eq: ${enumTypeName}
    in: [${enumTypeName}]
    nin: [${enumTypeName}]
}`
    }
}
