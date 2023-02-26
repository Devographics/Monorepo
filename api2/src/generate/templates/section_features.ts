// note: not currently exposed

import { TemplateFunction } from '../types'
import { graphqlize, getSectionItems } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const section_tools: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}${graphqlize(
        section.id
    )}AllFeatures`
    const items = getSectionItems({ survey, edition, section })

    return {
        id: `${section.id}_all_items`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    data(filters: ${getFiltersTypeName(
        survey.id
    )},  parameters: Parameters, facet: ${getFacetsTypeName(survey.id)}): [${graphqlize(
            survey.id
        )}Feature]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, items })
    }
}
