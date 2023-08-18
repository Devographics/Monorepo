import { getEditionItems, graphqlize } from '../../generate/helpers'
import { TypeDefTemplateOutput, SurveyApiObject, Survey } from '../../types'
import uniq from 'lodash/uniq.js'

/*

Sample output:

enum StateOfCSSFeaturesID {
    subgrid
    at_container
    aspect_ratio
    ...
}

*/

export const getFeaturesEnumTypeName = (survey: Survey | SurveyApiObject) =>
    `${graphqlize(survey.id)}FeaturesID`

export const generateFeaturesEnumType = ({
    survey,
    path
}: {
    survey: SurveyApiObject
    path: string
}): TypeDefTemplateOutput | null => {
    const typeName = getFeaturesEnumTypeName(survey)
    const allFeatures = survey.editions.map(e => getEditionItems(e, 'features')).flat()
    const allFeaturesIDs = uniq(allFeatures.map(q => q.id))

    if (allFeaturesIDs.length === 0) {
        return null
    } else {
        return {
            generatedBy: 'features_enum',
            path,
            typeName,
            typeDef: `enum ${typeName} {
${allFeaturesIDs.join('\n    ')}
}`
        }
    }
}
