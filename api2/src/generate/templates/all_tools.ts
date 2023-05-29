import { Question } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'

export const all_tools: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllTools`
    let items: Question[] = []
    for (const section of edition.sections.filter(s => s.template === 'tool')) {
        items = [...items, ...getSectionItems({ survey, edition, section })]
    }
    return {
        ...question,
        id: `allTools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Tool]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, edition, items })
    }
}
