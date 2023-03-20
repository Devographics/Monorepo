import { useMemo } from 'react'
import { useTheme } from 'styled-components'
import compact from 'lodash/compact'
import round from 'lodash/round'
import { useI18n } from 'core/i18n/i18nContext'
import { ToolExperienceId, ToolsSectionId } from 'core/bucket_keys'
import { getTableData } from 'core/helpers/datatables'
import {
    ToolsQuadrantsMetric,
    ToolsQuadrantsChartToolData,
    ToolsQuadrantsChartToolsCategoryData
} from './types'
import { ToolQuestionData, SectionMetadata, Entity } from '@devographics/types'
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
    const total = responses.currentEdition?.completion.total

    // if the tool doesn't have experience data, abort
    if (!buckets) return null

    // get count for a given experience choice
    const getCount = (experienceId: ToolExperienceId) => {
        const experienceBucket = buckets.find(b => b.id === experienceId)

        return experienceBucket ? experienceBucket.count : 0
    }

    const counts: Record<ToolExperienceId, number> = {
        never_heard: getCount('never_heard'),
        interested: getCount('interested'),
        not_interested: getCount('not_interested'),
        would_use: getCount('would_use'),
        would_not_use: getCount('would_not_use')
    }

    const totals = {
        usage: counts.would_use + counts.would_not_use,
        // calculate satisfaction ratio against usage
        satisfaction: counts.would_use + counts.would_not_use,
        // calculate interest ratio against awareness
        interest: counts.interested + counts.not_interested,
        // calculate awareness ratio against total
        awareness: total
    }

    const getPercentage = (experienceId: ToolExperienceId) => {
        return toPercentage(counts[experienceId] / totals[metric])
    }

    const percentages = {
        satisfaction: getPercentage('would_use'),
        interest: getPercentage('interested'),
        awareness: 100 - getPercentage('never_heard')
    }

    const entity = entities.find(e => e.id === id)

    if (!entity) {
        throw new Error(`Could not find entity for tool id ${id}`)
    }

    // note: we use the same x (nb of users) for all metrics to stay consistent
    return {
        id,
        name: entity?.name,
        usage_count: totals?.usage,
        satisfaction_percentage: percentages?.satisfaction,
        interest_percentage: percentages?.interest,
        x: totals?.usage,
        y: percentages[metric]
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
