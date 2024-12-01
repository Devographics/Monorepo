import { Entity } from '@devographics/types'
import { TypeDefTemplateOutput, TypeTypeEnum } from '../../types'

/*

Sample output:

enum EntitiesTagsEnum {
    spanish
    women
    video_creators
}

*/

export const entitiesTagsEnumTypeName = 'EntitiesTagsEnum'

export const generateEntitiesTagsEnum = ({
    entities
}: {
    entities: Entity[]
}): TypeDefTemplateOutput => {
    const tags = [...new Set(entities.map(e => e.tags).flat())]
    tags.forEach(tag => {
        if (tag?.match('-')) {
            console.warn(
                `Tag "${tag}" contains a dash, which is not allowed in GraphQL enum values. Replace by an underscore in the entities repo.`
            )
        }
    })
    return {
        generatedBy: `entities_tags_enum`,
        typeName: entitiesTagsEnumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${entitiesTagsEnumTypeName} {
    ${tags.join('\n    ')}
}`
    }
}
