import { getEditionItems, graphqlize } from '../../generate/helpers'
import { TypeDefTemplateOutput, SurveyApiObject, Survey } from '../../types'
import uniq from 'lodash/uniq.js'

/*

Sample output:

enum StateOfJSToolsID {
    react
    angular
    jest
    ...
}

*/

export const getToolsEnumTypeName = (survey: Survey | SurveyApiObject) =>
    `${graphqlize(survey.id)}ToolsID`

export const generateToolsEnumType = ({
    survey,
    path
}: {
    survey: SurveyApiObject
    path: string
}): TypeDefTemplateOutput | null => {
    const typeName = getToolsEnumTypeName(survey)
    const allTools = survey.editions.map(e => getEditionItems(e, 'tools')).flat()
    const allToolsIDs = uniq(allTools.map(q => q.id))

    if (allToolsIDs.length === 0) {
        return null
    } else {
        return {
            generatedBy: 'tools_enum',
            path,
            typeName,
            typeDef: `enum ${typeName} {
${allToolsIDs.join('\n    ')}
}`
        }
    }
}
