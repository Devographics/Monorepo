import { Option } from '../../types'
import { graphqlize } from '../../generate/helpers'
import { ParsedQuestion } from '../../generate/types'

/*

Sample output:

type DisabilityStatusOption {
    id: DisabilityStatusID
    editions: [StateOfJsEditionID]
}

*/

export const generateOptionType = ({ question }: { question: ParsedQuestion }) => {
    const { optionTypeName, enumTypeName, surveyId, options } = question
    if (!optionTypeName) return
    const optionsHaveAverage = options?.some((o: Option) => typeof o.average !== 'undefined')
    return {
        typeName: optionTypeName,
        typeType: 'option',
        typeDef: `type ${optionTypeName} {
    id: ${enumTypeName}
    entity: Entity
    editions: [${graphqlize(surveyId)}EditionID]${optionsHaveAverage ? '\n    average: Float' : ''}
}`
    }
}
