import {
    Survey,
    Edition,
    SurveyApiObject,
    EditionApiObject,
    TypeDefTemplateOutput
} from '../../types'
/*

Sample output:

enum AllEditionsID {
    js2020
    js2021
    js2022
    js2023
    css2020
    css2021
    …
}

*/

export const generateAllEditionsEnumType = ({
    surveys,
    path
}: {
    surveys: SurveyApiObject[]
    path: string
}): TypeDefTemplateOutput => {
    const editions = surveys.map(s => s.editions).flat()
    const typeName = 'AllEditionsID'
    return {
        generatedBy: 'all_editions_enum',
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${editions.map((e: EditionApiObject) => e.id).join('\n    ')}
}`
    }
}
