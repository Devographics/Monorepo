import { graphqlize } from '../../generate/helpers'
import { Survey } from '../../generate/types'

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

export const generateSurveysType = ({ surveys, path }: { surveys: Survey[]; path: string }) => {
    return {
        path,
        typeName: 'Surveys',
        typeDef: `type Surveys {
    ${surveys
        .map((survey: Survey) => `${survey.id}: ${graphqlize(survey.id)}Survey`)
        .join('\n    ')}
}`
    }
}
