import { QuestionObject, TemplateFunction, ResolverMap, Survey } from '../types'
import { getSectionItems, graphqlize } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../graphql_templates'

/*

Resolver map used for all_features, all_tools, section_features, section_tools

*/
export const getResolverMap = ({
    survey,
    items
}: {
    survey: Survey
    items: QuestionObject[]
}): ResolverMap => ({
    data: async (parent, args, context, info) => {
        return items.map(question => ({ ...parent, question }))
    },
    ids: () => {
        return items.map(q => q.id)
    },
    years: () => {
        return survey.editions.map(e => e.year)
    }
})

export const all_features: TemplateFunction = ({ survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllFeatures`
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
        )}): [Feature]
}`,
        resolverMap: getResolverMap({ survey, items })
    }
}
