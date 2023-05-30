import { Question, QuestionApiObject } from '../../types/surveys'
import { getSectionItems, graphqlize } from '../helpers'
import { getEditionToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'

export const all_features: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllFeatures`
    return {
        ...question,
        id: `allFeatures`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Feature]
}`,
        resolverMap: getEditionToolsFeaturesResolverMap('features')
    }
}
