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
    """
    Processed data for all editions of this survey
    """
    allEditions(editionCount: Int, editionId: AllEditionsID): [ResponseEditionData]
    """
    Processed data for the current edition of this survey (as indicated by the parent field)
    """
    currentEdition: ResponseEditionData
    """
    (DEPRECATED)
    Raw answer for the current edition of this survey
    """
    rawData(token: String): RawData
}`
    }
}
