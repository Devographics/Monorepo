import { Option, OptionGroup } from '@devographics/types'
import { formatNumericOptions } from '../../generate/helpers'
import { QuestionApiObject, TypeDefTemplateOutput, TypeTypeEnum } from '../../types'

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
        formattedOptions = optionsAreNumeric ? formatNumericOptions<OptionGroup>(groups) : groups
    } else if (options) {
        formattedOptions = optionsAreNumeric ? formatNumericOptions<Option>(options) : options
    } else {
        return
    }
    return {
        generatedBy: 'enum',
        typeName: enumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${enumTypeName} {
    ${formattedOptions.map(o => o.id).join('\n    ')}
}`
    }
}
