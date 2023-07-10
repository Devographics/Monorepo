import { graphqlize } from '../../generate/helpers'
import { Survey, Edition, SurveyApiObject, EditionApiObject } from '../../types/surveys'

/*

Sample output:

type StateOfJsSurvey {
    year_2016: StateOfJs2016Edition
    year_2017: StateOfJs2017Edition
    year_2018: StateOfJs2018Edition
    year_2019: StateOfJs2019Edition
    year_2020: StateOfJs2020Edition
    year_2021: StateOfJs2021Edition
    year_2022: StateOfJs2022Edition
}

*/

export const generateSurveyType = ({ survey, path }: { survey: SurveyApiObject; path: string }) => {
    const typeName = graphqlize(survey.id) + 'Survey'
    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    _metadata: SurveyMetadata
    ${survey.editions
        .map((edition: EditionApiObject) => `${edition.id}: ${graphqlize(edition.id)}Edition`)
        .join('\n    ')}
}`
    }
}
