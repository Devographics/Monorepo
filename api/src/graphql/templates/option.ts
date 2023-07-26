import { Option, TypeTypeEnum } from '../../types'
import { graphqlize } from '../../generate/helpers'
import { QuestionApiObject, TypeDefTemplateOutput } from '../../types'

/*

Sample output:

type DisabilityStatusOption {
    id: DisabilityStatusID
    editions: [StateOfJsEditionID]
}

Note: when option are numeric, we use the Float type because enums items
can't be numbers.

*/

export const generateOptionType = ({
    question
}: {
    question: QuestionApiObject
}): TypeDefTemplateOutput | undefined => {
    const { optionTypeName, enumTypeName, surveyId, options, optionsAreNumeric } = question
    if (!optionTypeName) return
    const optionsHaveAverage = options?.some((o: Option) => typeof o.average !== 'undefined')
    return {
        generatedBy: 'option',
        typeName: optionTypeName,
        typeType: TypeTypeEnum.OPTION,
        typeDef: `type ${optionTypeName} {
    id: ${optionsAreNumeric ? 'Float' : enumTypeName}
    label: String
    entity: Entity
    editions: [${graphqlize(surveyId)}EditionID]${optionsHaveAverage ? '\n    average: Float' : ''}
}`
    }
}
