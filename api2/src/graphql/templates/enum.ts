import { formatNumericOptions } from '../../generate/helpers'
import { ParsedQuestion } from '../../types/surveys'

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

export const generateEnumType = ({ question }: { question: ParsedQuestion }) => {
    const { enumTypeName, options, optionsAreNumeric } = question
    if (!enumTypeName || !options) return
    const formattedOptions = optionsAreNumeric ? formatNumericOptions(options) : options
    return {
        typeName: enumTypeName,
        typeType: 'enum',
        typeDef: `enum ${enumTypeName} {
    ${formattedOptions.map(o => o.id).join('\n    ')}
}`
    }
}
