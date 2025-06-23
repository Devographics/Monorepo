import { Option, OptionGroup } from '@devographics/types'
import { formatNumericOptions } from '../../generate/helpers'
import { QuestionApiObject, TypeDefTemplateOutput, TypeTypeEnum } from '../../types'
import { isValidGraphQLName } from '../helpers'

/*

Sample output:

enum DisabilityStatusID {
    visual_impairments
    hearing_impairments
    mobility_impairments
    cognitive_impairments
    not_listed
}

*/

export const generateEnumType = ({
    question
}: {
    question: QuestionApiObject
}): TypeDefTemplateOutput | undefined => {
    const { enumTypeName, options, groups, optionsAreNumeric } = question
    let formattedOptions
    if (!enumTypeName) {
        return
    } else if (groups) {
        formattedOptions = groups
    } else if (options) {
        formattedOptions = optionsAreNumeric ? formatNumericOptions<Option>(options) : options
    } else {
        return
    }
    formattedOptions = formattedOptions.filter(option => {
        if (isValidGraphQLName(String(option.id))) {
            return true
        } else {
            console.warn(`⚠️ “${option.id}” (${question.id}) is not valid as a GraphQL property`)
            return false
        }
    })
    return {
        generatedBy: `enum/[${question.editions?.join(',')}]/${question.id}`,
        typeName: enumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${enumTypeName} {
    ${formattedOptions.map(o => o.id).join('\n    ')}
}`
    }
}
