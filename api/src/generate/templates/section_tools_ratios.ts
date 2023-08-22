import { ApiTemplateFunction, ResolverMap, SectionApiObject } from '../../types/surveys'
import { graphqlize } from '../helpers'
import { computeKey, useCache } from '../../helpers/caching'
import { computeToolsExperienceRatios } from '../../compute/experience'
import { getToolsEnumTypeName } from '../../graphql/templates/tools_enum'

const getSectionToolsIds = (section: SectionApiObject) => {
    const sectionTools = section.questions.filter(q => q.template === 'tool')
    const tools = sectionTools.map(q => q.id)
    return tools
}

const getResolverMap = (): ResolverMap => ({
    items: async (parent, args, context, info) => {
        const { survey, edition, section, question } = parent
        const { itemIds, filters, parameters = {} } = args
        const { enableCache } = parameters

        const tools = itemIds || getSectionToolsIds(section)
        return await useCache({
            key: computeKey(computeToolsExperienceRatios, {
                editionId: edition.id,
                questionId: question.id,
                ...args
            }),
            func: computeToolsExperienceRatios,
            context,
            funcOptions: { survey, tools, filters, context },
            enableCache
        })
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
