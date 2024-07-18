// not used anymore, replaced by the _items field that lives directly on the section object

import { ApiTemplateFunction } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { getSectionToolsFeaturesResolverMap } from '../resolvers'
import { getFeatureFieldTypeName } from './feature'

export const section_features: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}SectionFeatures`
    return {
        ...question,
        id: `_${section.id}_items`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${getFeatureFieldTypeName({ survey })}]
}`,
        resolverMap: getSectionToolsFeaturesResolverMap('features')
    }
}
