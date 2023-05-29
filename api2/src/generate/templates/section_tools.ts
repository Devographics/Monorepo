import { ApiTemplateFunction } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getToolsFeaturesResolverMap } from '../resolvers'

export const section_tools: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}SectionTools`

    const items = getSectionItems({ survey, edition, section })

    return {
        ...question,
        id: `${section.id}_allTools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Tool]
}`,
        resolverMap: getToolsFeaturesResolverMap({ survey, edition, items })
    }
}
