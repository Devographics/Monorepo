import { ParsedQuestionExt, TemplateFunction } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getFiltersTypeName, getFacetsTypeName } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const all_tools: TemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}AllTools`
    let items: ParsedQuestionExt[] = []
    for (const section of edition.sections.filter(s => s.template === 'tool')) {
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
        )}Tool]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, items })
    }
}
