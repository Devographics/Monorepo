import { useMemo } from 'react'
import { useTheme } from 'styled-components'
import compact from 'lodash/compact'
import round from 'lodash/round'
import { useI18n } from '@devographics/react-i18n'
import { ToolExperienceId, ToolsSectionId } from 'core/bucket_keys'
import { getTableData } from 'core/helpers/datatables'
import {
    ToolsQuadrantsMetric,
    ToolsQuadrantsChartToolData,
    ToolsQuadrantsChartToolsCategoryData
} from './types'
import { ToolQuestionData, SectionMetadata, Entity, FeaturesOptions } from '@devographics/types'
import { useToolSections } from 'core/helpers/metadata'
import { useEntities } from 'core/helpers/entities'

const toPercentage = (value: number) => round(value * 100, 2)

const extractToolData = (
    tool: ToolQuestionData,
    metric: ToolsQuadrantsMetric,
    entities: Entity[]
): ToolsQuadrantsChartToolData | null => {
    const { id, responses } = tool
    const buckets = responses.currentEdition?.buckets

    // if the tool doesn't have experience data, abort
    if (!buckets) return null

    const usage =
        tool.responses.currentEdition.buckets.find(b => b.id === FeaturesOptions.USED)?.count || 0

    const entity = entities.find(e => e.id === id)

    if (!entity) {
        throw new Error(`Could not find entity for tool id ${id}`)
    }
    // note: we use the same x (nb of users) for all metrics to stay consistent
    return {
        id,
        name: entity?.name,
        usage_count: usage,
        satisfaction_percentage: (tool.responses.currentEdition.ratios?.retention || 0) * 100,
        interest_percentage: (tool.responses.currentEdition.ratios?.interest || 0) * 100,
        x: usage,
        y: (tool.responses.currentEdition.ratios?.[metric] || 0) * 100
    }
}

/**
 * Parse data and convert it into a format compatible
 * with the ScatterPlot chart.
 */
export const useChartData = (
    data: ToolQuestionData[],
    metric: ToolsQuadrantsMetric
): ToolsQuadrantsChartToolsCategoryData[] => {
    const { translate } = useI18n()
    const theme = useTheme()
    const toolSections = useToolSections()
    const allEntities = useEntities()
    const allTools = toolSections.map((section: SectionMetadata) => {
        const toolsSectionId = section.id
        const toolsIds = section.questions.map(q => q.id)

        const categoryTools = data.filter(toolData => toolsIds.includes(toolData.id))
        const categoryData =
            categoryTools &&
            categoryTools.map(toolData => extractToolData(toolData, metric, allEntities))

        const color = theme.colors.ranges.toolSections[toolsSectionId as ToolsSectionId]

        // filter out categories without data
        return categoryData.length > 0
            ? {
                  id: toolsSectionId as ToolsSectionId,
                  name: translate(`page.${toolsSectionId}`),
                  color,
                  data: compact(categoryData)
              }
            : null
    })

    return compact(allTools)
}

export const useTabularData = (data: ToolQuestionData[], metric: ToolsQuadrantsMetric) => {
    const allEntities = useEntities()
    return useMemo(() => {
        return [
            getTableData({
                data: data
                    .map(tool => extractToolData(tool, metric, allEntities))
                    .filter(tool => tool !== null) as ToolsQuadrantsChartToolData[],
                valueKeys: ['usage_count', 'satisfaction_percentage', 'interest_percentage']
            })
        ]
    }, [data, metric])
}
