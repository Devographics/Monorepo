import { ParsedQuestion, TemplateFunction, ResolverMap, Survey } from '../types'
import { getSectionItems, graphqlize } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const all_features: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllFeatures`
    let items: ParsedQuestion[] = []
    for (const section of edition.sections.filter(s => s.template === 'feature')) {
        items = [...items, ...getSectionItems({ survey, edition, section })]
    }
    return {
        id: `all_items`,
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
