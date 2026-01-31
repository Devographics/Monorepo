// not used anymore, replaced by the _items field that lives directly on the section object

import { ITEMS_ID } from '@devographics/constants'
import { ApiTemplateFunction } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { getSectionToolsFeaturesResolverMap } from '../resolvers'
import { getFeatureFieldTypeName } from './feature'

export const section_features: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}SectionFeatures`
    return {
        ...question,
        id: `_${section.id}${ITEMS_ID}`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${getFeatureFieldTypeName({ survey })}]
}`,
        resolverMap: getSectionToolsFeaturesResolverMap('features')
    }
}
