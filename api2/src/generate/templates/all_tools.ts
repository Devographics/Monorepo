import { ParsedQuestion, TemplateFunction } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const all_tools: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllItems`
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
        )}Tool]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, items })
    }
}
