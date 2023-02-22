import { QuestionObject, TemplateFunction } from '../types'
import { graphqlize, getSectionItems } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'
import { getResolverMap } from './all_features'

export const all_tools: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllItems`
    let items: QuestionObject[] = []
    for (const section of edition.sections.filter(s => s.template === 'feature')) {
        items = [...items, ...getSectionItems({ survey, edition, section })]
    }
    return {
        id: `all_items`,
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
