import { TemplateArguments, ResolverType } from '../types'
import { graphqlize } from '../helpers'
import { useCache } from '../../caching'
import { computeToolsExperienceRanking } from '../../compute/experience'

export const tools_experience_ranking = ({ survey, section }: TemplateArguments) => {
    const fieldTypeName = `${graphqlize(section.id)}ToolsRankings`
    // in any given section, the tools will be the questions which don't have a template defined
    const sectionTools = section.questions.filter(q => typeof q.template === 'undefined')
    return {
        id: `${section.id}_tools_experience_ranking`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]!
            years: [Int]
            experience(filters: ${graphqlize(survey.id)}Filters): [ToolExperienceRanking]
        }`,
        resolverMap: {
            experience: (root, args, context, info) => {
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
