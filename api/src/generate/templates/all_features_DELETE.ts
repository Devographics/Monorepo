// not used anymore going forward
import { Question, QuestionApiObject } from '../../types/surveys'
import { getSectionItems, graphqlize } from '../helpers'
import { getEditionToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'
import { getFeatureFieldTypeName } from './feature'

export const all_features: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllFeatures`
    return {
        ...question,
        id: `_features_items`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${getFeatureFieldTypeName({ survey })}]
}`,
        resolverMap: getEditionToolsFeaturesResolverMap('features')
    }
}
