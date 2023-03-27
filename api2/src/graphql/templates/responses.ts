import { graphqlize } from '../../generate/helpers'
import { ParsedSurvey } from '../../types/surveys'

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

export const getResponseTypeName = (surveyId: string) => `${graphqlize(surveyId)}Responses`

export const generateResponsesType = ({ survey, path }: { survey: ParsedSurvey; path: string }) => {
    const typeName = getResponseTypeName(survey.id)
    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    allEditions: [ResponseEditionData]
    currentEdition: ResponseEditionData
}`
    }
}
