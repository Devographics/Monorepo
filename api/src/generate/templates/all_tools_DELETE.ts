import { Question } from '../../types/surveys'
import { graphqlize, getSectionItems } from '../helpers'
import { getEditionToolsFeaturesResolverMap } from '../resolvers'
import { ApiTemplateFunction } from '../../types/surveys'
import { getToolFieldTypeName } from './tool'

export const all_tools: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}AllTools`
    return {
        ...question,
        id: `allTools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${getToolFieldTypeName({ survey })}]
}`,
        resolverMap: getEditionToolsFeaturesResolverMap('tools')
    }
}
