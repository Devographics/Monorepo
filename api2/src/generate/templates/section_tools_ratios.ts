import { TemplateFunction, ResolverMap, Survey, Section } from '../types'
import { graphqlize } from '../helpers'
import { useCache } from '../../caching'
import { computeToolsExperienceRanking } from '../../compute/experience'

export const section_tools_ratios: TemplateFunction = ({ survey, section }) => {
    const fieldTypeName = `${graphqlize(section.id)}ToolsRankings`
    // in any given section, the tools will be the questions which don't have a template defined
    const sectionTools = section.questions.filter(q => typeof q.template === 'undefined')

    return {
        id: `${section.id}_ratios`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]
            years: [Int]
            data(filters: ${graphqlize(survey.id)}Filters): [ToolExperienceRanking]
        }`,
        resolverMap: {
            data: (parent, args, context, info) => {
                const { filters } = args
                const tools = sectionTools.map(q => q.id)
                return useCache({
                    func: computeToolsExperienceRanking,
                    context,
                    funcOptions: { survey, tools, filters }
                })
            },
            ids: () => {
                return sectionTools.map(q => q.id)
            },
            years: () => {
                return survey.editions.map(e => e.year)
            }
        }
    }
}
