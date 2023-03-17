import { ParsedQuestionExt, TemplateFunction, ResolverMap, Survey } from '../../types/surveys'
import { getSectionItems, graphqlize } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const all_features: TemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllFeatures`
    let items: ParsedQuestionExt[] = []
    for (const section of edition.sections.filter(s => s.template === 'feature')) {
        items = [...items, ...getSectionItems({ survey, edition, section })]
    }
    return {
        ...question,
        id: `allItems`,
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
