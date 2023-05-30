import { ApiTemplateFunction } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { getSectionToolsFeaturesResolverMap } from '../resolvers'

export const section_tools: ApiTemplateFunction = ({ question, survey, edition, section }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}SectionTools`
    return {
        ...question,
        id: `${section.id}_tools`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    ids: [String]
    years: [Int]
    items: [${graphqlize(survey.id)}Tool]
}`,
        resolverMap: getSectionToolsFeaturesResolverMap('tools')
    }
}
