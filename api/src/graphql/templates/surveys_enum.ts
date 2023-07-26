import { TypeDefTemplateOutput, SurveyApiObject } from '../../types'

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
}): TypeDefTemplateOutput => {
    const typeName = 'SurveysID'
    return {
        generatedBy: 'surveys_enum',
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${surveys.map((s: SurveyApiObject) => s.id).join('\n    ')}
}`
    }
}
