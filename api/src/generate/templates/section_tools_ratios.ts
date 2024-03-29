import { ApiTemplateFunction, ResolverMap, SectionApiObject } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { computeKey, useCache } from '../../helpers/caching'
import { applyRankCutoff, computeExperienceRatios } from '../../compute/experience'
import { getToolsEnumTypeName } from '../../graphql/templates/tools_enum'

const getSectionToolsIds = (section: SectionApiObject) => {
    const sectionTools = section.questions.filter(q => q.template === 'tool')
    const tools = sectionTools.map(q => q.id)
    return tools
}

const getResolverMap = (): ResolverMap => ({
    items: async (parent, args, context, info) => {
        const { survey, edition, section, question } = parent
        const { itemIds: itemIds_, filters, parameters = {} } = args
        const { enableCache, years, rankCutoff } = parameters

        const itemIds = itemIds_ || getSectionToolsIds(section)
        const type = 'tool'
        const funcOptions = { survey, itemIds, type, years, filters, context }

        const key = computeKey(computeExperienceRatios, {
            editionId: edition.id,
            questionId: question.id,
            itemIds: itemIds_ || 'allItems',
            years: years || 'allYears',
            filters
        })

        const results = await useCache({
            key,
            func: computeExperienceRatios,
            context,
            funcOptions,
            enableCache
        })

        // note: we do this here to avoid generating different cache keys for different
        // cutoff points, since we have to calculate data for all items anyway no matter the cutoff
        return applyRankCutoff(results, rankCutoff)
    },
    ids: ({ section }, { itemIds }) => {
        return itemIds || getSectionToolsIds(section)
    },
    years: ({ survey }) => {
        return survey.editions.map(e => e.year)
    }
})

export const section_tools_ratios: ApiTemplateFunction = ({
    survey,
    edition,
    section,
    question
}) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(section.id)}ToolsRatios`
    const toolsEnumTypeName = getToolsEnumTypeName(survey)
    return {
        ...question,
        id: `${section.id}_ratios`,
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]
            years: [Int]
            items(itemIds: [${toolsEnumTypeName}], parameters: ToolRatiosParameters, filters: ${graphqlize(
            survey.id
        )}Filters): [ToolRatiosItemData]
        }`,
        resolverMap: getResolverMap()
    }
}
