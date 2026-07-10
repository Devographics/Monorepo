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
            console.warn(
                `⚠️ “${option.id}” (${question.edition?.id}/${question.id}) is not valid as a GraphQL property`
            )
            return false
        }
    })
    /*

    We artificially always add limitations/interop_issues/etc. as enum values so that queries that try to filter by them don't trigger errors, even if the item wouldn't otherwise be part of the dynamic enum.

    */
    const formattedOptionsIds = formattedOptions.map(o => o.id)
    const alwayAdd = ['limitations', 'interop_issues']
    for (const tokenId of alwayAdd) {
        if (!formattedOptionsIds.includes(tokenId)) {
            formattedOptionsIds.push(tokenId)
        }
    }

    return {
        generatedBy: `enum/[${question.editions?.join(',')}]/${question.id}`,
        typeName: enumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${enumTypeName} {
    ${formattedOptionsIds.join('\n    ')}
}`
    }
}
