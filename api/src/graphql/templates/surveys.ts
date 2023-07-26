import { graphqlize } from '../../generate/helpers'
import { TypeDefTemplateOutput, SurveyApiObject } from '../../types'

/*

Sample output:

type Surveys {
    metadata: SurveyMetadata
    demo_survey: DemoSurveySurvey
    state_of_css: StateOfCssSurvey
    state_of_graphql: StateOfGraphqlSurvey
    state_of_js: StateOfJsSurvey
}
*/

export const generateSurveysType = ({
    surveys,
    path
}: {
    surveys: SurveyApiObject[]
    path: string
}): TypeDefTemplateOutput => {
    return {
        generatedBy: 'surveys',
        path,
        typeName: 'Surveys',
        typeDef: `type Surveys {
    ${surveys
        .map((survey: SurveyApiObject) => `${survey.id}: ${graphqlize(survey.id)}Survey`)
        .join('\n    ')}
}`
    }
}
