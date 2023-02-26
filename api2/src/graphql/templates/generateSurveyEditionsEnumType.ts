import { graphqlize } from '../../generate/helpers'
import { Survey, Edition } from '../../generate/types'

/*

Sample output:

enum StateOfJsEditionID {
    js2020
    js2021
    js2022
    js2023
}

*/

export const generateSurveyEditionsEnumType = ({
    survey,
    path
}: {
    survey: Survey
    path: string
}) => {
    const { editions } = survey
    const typeName = `${graphqlize(survey.id)}EditionID`
    return {
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${editions.map((e: Edition) => e.id).join('\n    ')}
}`
    }
}
