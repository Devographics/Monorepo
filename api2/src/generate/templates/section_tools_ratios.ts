import { TemplateFunction, ResolverMap, Survey, Question } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { computeKey, useCache } from '../../helpers/caching'
import { computeToolsExperienceRatios } from '../../compute/experience'

const getResolverMap = ({
    survey,
    sectionTools
}: {
    survey: Survey
    sectionTools: Question[]
}): ResolverMap => ({
    data: async (parent, args, context, info) => {
        const { survey, edition, section, question } = parent
        const { filters } = args
        const tools = sectionTools.map(q => q.id)
        return await useCache({
            key: computeKey(computeToolsExperienceRatios, {
                surveyId: survey.id,
                editionId: edition.id,
                sectionId: section.id,
                questionId: question.id,
                ...args
            }),
            func: computeToolsExperienceRatios,
            context,
            funcOptions: { survey, tools, filters, context }
        })
    },
    ids: () => {
        return sectionTools.map(q => q.id)
    },
    years: () => {
        return survey.editions.map(e => e.year)
    }
})

export const section_tools_ratios: TemplateFunction = ({ survey, section, question }) => {
    const fieldTypeName = `${graphqlize(section.id)}ToolsRankings`
    // in any given section, the tools will be the questions which don't have a template defined
    const sectionTools = section.questions.filter(q => typeof q.template === 'undefined')

    return {
        ...question,
        id: `${section.id}_ratios`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]
            years: [Int]
            data(filters: ${graphqlize(survey.id)}Filters): [ToolExperienceRanking]
        }`,
        resolverMap: getResolverMap({ survey, sectionTools })
    }
}
