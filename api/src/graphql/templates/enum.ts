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
    const { enumTypeName, options, optionsAreNumeric } = question
    if (!enumTypeName || !options) return
    const formattedOptions = optionsAreNumeric ? formatNumericOptions(options) : options
    return {
        generatedBy: 'enum',
        typeName: enumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${enumTypeName} {
    ${formattedOptions.map(o => o.id).join('\n    ')}
}`
    }
}
