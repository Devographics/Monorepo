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
    return {
        generatedBy: `entities_tags_enum`,
        typeName: entitiesTagsEnumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${entitiesTagsEnumTypeName} {
    ${tags.join('\n    ')}
}`
    }
}
