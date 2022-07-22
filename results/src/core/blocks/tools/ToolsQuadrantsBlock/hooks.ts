import { useMemo } from 'react'
import { useTheme } from 'styled-components'
import compact from 'lodash/compact'
import round from 'lodash/round'
import get from 'lodash/get'
// @ts-ignore: we don't have typings for the variables
import variables from 'Config/variables.yml'
import { useI18n } from 'core/i18n/i18nContext'
import { ToolExperienceId, ToolsSectionId } from 'core/bucket_keys'
import { getTableData } from 'core/helpers/datatables'
import {
    ToolsQuadrantsMetric,
    ToolsQuadrantsApiDatum,
    ToolsQuadrantsChartToolData,
    ToolsQuadrantsChartToolsCategoryData,
} from './types'

const { toolsCategories } = variables

const toPercentage = (value: number) => round(value * 100, 2)

const extractToolData = (
    tool: ToolsQuadrantsApiDatum,
    metric: ToolsQuadrantsMetric
): ToolsQuadrantsChartToolData | null => {
    const { id, entity, experience } = tool
    const buckets: ToolsQuadrantsApiDatum['experience']['year']['facets'][0]['buckets'] = get(experience, 'year.facets[0].buckets')
    const total: number = get(experience, 'year.completion.total')

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
        would_not_use: getCount('would_not_use'),
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
        awareness: 100 - getPercentage('never_heard'),
    }

    // note: we use the same x (nb of users) for all metrics to stay consistent
    return {
        id,
        name: entity?.name,
        usage_count: totals?.usage,
        satisfaction_percentage: percentages?.satisfaction,
        interest_percentage: percentages?.interest,
        x: totals?.usage,
        y: percentages[metric],
    }
}

/**
 * Parse data and convert it into a format compatible
 * with the ScatterPlot chart.
 */
export const useChartData = (
    data: ToolsQuadrantsApiDatum[],
    metric: ToolsQuadrantsMetric
): ToolsQuadrantsChartToolsCategoryData[] => {
    const { translate } = useI18n()
    const theme = useTheme()

    return useMemo(() => {
        const allTools = Object.keys(toolsCategories)
            .filter(toolsSectionId => !toolsSectionId.includes('abridged'))
            .map(toolsSectionId => {
                const toolsIds = toolsCategories[toolsSectionId]

                const categoryTools = data.filter(tool => toolsIds.includes(tool.id))
                const categoryData =
                    categoryTools && categoryTools.map(tool => extractToolData(tool, metric))

                const color = theme.colors.ranges.toolSections[toolsSectionId as ToolsSectionId]

                // filter out categories without data
                return categoryData.length > 0
                    ? {
                          id: toolsSectionId as ToolsSectionId,
                          name: translate!(`page.${toolsSectionId}`),
                          color,
                          data: compact(categoryData),
                      }
                    : null
            })

        return compact(allTools)
    }, [translate, theme, metric])
}

/**
 * Generate legends for the chart, legends being tools categories.
 */
export const useChartLegends = () => {
    const { translate } = useI18n()
    const theme = useTheme()

    return useMemo(() => Object.keys(toolsCategories).map(toolsSectionId => ({
        id: `toolCategories.${toolsSectionId}`,
        label: translate!(`sections.${toolsSectionId}.title`),
        keyLabel: `${translate!(`sections.${toolsSectionId}.title`)}:`,
        color: theme.colors.ranges.toolSections[toolsSectionId as ToolsSectionId]
    })), [translate])
}

export const useTabularData = (
    data: ToolsQuadrantsApiDatum[],
    metric: ToolsQuadrantsMetric
) => useMemo(() => {
    return [getTableData({
        data: data.map(tool => extractToolData(tool, metric))
            .filter(tool => tool !== null) as ToolsQuadrantsChartToolData[],
        valueKeys: ['usage_count', 'satisfaction_percentage', 'interest_percentage']
    })]
}, [data, metric])
