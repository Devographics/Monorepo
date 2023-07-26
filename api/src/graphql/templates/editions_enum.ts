import { graphqlize } from '../../generate/helpers'
import { SurveyApiObject, EditionApiObject, TypeDefTemplateOutput } from '../../types'

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
}): TypeDefTemplateOutput => {
    const { editions } = survey
    const typeName = getEditionsEnumTypeName(survey.id)
    return {
        generatedBy: 'editions_enum',
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${editions.map((e: EditionApiObject) => e.id).join('\n    ')}
}`
    }
}
