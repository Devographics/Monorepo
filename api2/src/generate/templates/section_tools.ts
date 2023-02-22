import { TemplateFunction } from '../types'
import { graphqlize, getSectionItems } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'
import { getResolverMap } from './all_features'

export const section_tools: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}${graphqlize(
        section.id
    )}AllTools`

    const items = getSectionItems({ survey, edition, section })

    return {
        id: `${section.id}_all_items`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    data(filters: ${getFiltersTypeName(survey.id)},  options: Options, facet: ${getFacetsTypeName(
            survey.id
        )}): [${graphqlize(survey.id)}Tool]
}`,
        resolverMap: getResolverMap({ survey, items })
    }
}
