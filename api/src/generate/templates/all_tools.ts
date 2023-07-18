import { Question } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getEditionToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'

export const all_tools: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllTools`
    return {
        ...question,
        id: `allTools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Tool]
}`,
        resolverMap: getEditionToolsFeaturesResolverMap('tools')
    }
}
