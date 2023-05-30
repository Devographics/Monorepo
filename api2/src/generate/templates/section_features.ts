// note: not currently exposed

import { ApiTemplateFunction } from '../../types/surveys'

import { graphqlize, getSectionItems } from '../helpers'
import { getSectionToolsFeaturesResolverMap } from '../resolvers'

export const section_features: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}${graphqlize(
        section.id
    )}SectionFeatures`

    return {
        ...question,
        id: `${section.id}_features`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Feature]
}`,
        resolverMap: getSectionToolsFeaturesResolverMap('features')
    }
}
