import { Survey, SurveyApiObject } from '../../types/surveys'

/*

Sample output:

enum SurveysID {
    state_of_css
    state_of_js
    state_of_graphql
}

*/

export const generateSurveysEnumType = ({
    surveys,
    path
}: {
    surveys: SurveyApiObject[]
    path: string
}) => {
    const typeName = 'SurveysID'
    return {
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${surveys.map((s: SurveyApiObject) => s.id).join('\n    ')}
}`
    }
}
