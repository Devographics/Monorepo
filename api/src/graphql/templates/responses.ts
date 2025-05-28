import { graphqlize } from '../../generate/helpers'
import { SurveyApiObject, TypeDefTemplateOutput } from '../../types'

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

export const getResponseTypeName = () => `Responses`

export const generateResponsesType = ({
    survey,
    path
}: {
    survey: SurveyApiObject
    path: string
}): TypeDefTemplateOutput => {
    const typeName = getResponseTypeName()
    return {
        generatedBy: 'responses',
        path,
        typeName,
        typeDef: `type ${typeName} {
    allEditions(editionCount: Int, editionId: AllEditionsID): [ResponseEditionData]
    currentEdition: ResponseEditionData
    rawData(token: String): [RawData]
    rawDataStats(token: String): [WordCount]
}`
    }
}
