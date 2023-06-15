import { graphqlize } from '../../generate/helpers'
import { Survey, Edition, SurveyApiObject, EditionApiObject } from '../../types/surveys'

/*

Sample output:

enum StateOfJsEditionID {
    js2020
    js2021
    js2022
    js2023
}

*/

export const getEditionsEnumTypeName = (surveyId: string) => `${graphqlize(surveyId)}EditionID`

export const generateSurveyEditionsEnumType = ({
    survey,
    path
}: {
    survey: SurveyApiObject
    path: string
}) => {
    const { editions } = survey
    const typeName = getEditionsEnumTypeName(survey.id)
    return {
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${editions.map((e: EditionApiObject) => e.id).join('\n    ')}
}`
    }
}
