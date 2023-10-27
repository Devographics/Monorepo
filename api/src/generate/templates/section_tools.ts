import { ApiTemplateFunction } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { getSectionToolsFeaturesResolverMap } from '../resolvers'
import { getToolFieldTypeName } from './tool'

export const section_tools: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}SectionTools`
    return {
        ...question,
        id: `${section.id}_tools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${getToolFieldTypeName({ survey })}]
}`,
        resolverMap: getSectionToolsFeaturesResolverMap('tools')
    }
}
