import { graphqlize } from '../../generate/helpers'
import { ParsedSurvey } from '../../types/surveys'
import { getEditionsEnumTypeName } from './editions_enum'

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
    all_editions: [EditionData]
    edition(editionId: ${getEditionsEnumTypeName(survey.id)}!): EditionData
}`
    }
}
