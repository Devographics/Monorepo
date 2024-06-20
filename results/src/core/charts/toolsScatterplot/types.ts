import { ScatterPlotLayerProps } from '@nivo/scatterplot'
import { ToolExperienceId, ToolsSectionId } from 'core/bucket_keys'
import { Entity, YearCompletion } from '@types/index'
import { BlockContext } from 'core/blocks/types'

export type ToolsScatterplotBlockData = BlockContext<
    'scatterplot_overview',
    'ToolsScatterplotBlock',
    never,
    never
>

export interface ToolsQuadrantsApiDatum {
    // tool ID
    id: string
    entity: Entity
    experience: {
        keys: ToolExperienceId[]
        year: {
            completion: YearCompletion
            facets: [
                {
                    buckets: {
                        id: ToolExperienceId
                        // number of respondents who chose this option
                        // for this year.
                        count: number
                        // percentage against people who answered this question
                        percentageQuestion: number
                        // percentage against people overall survey participants
                        percentageSurvey: number
                    }[]
                }
            ]
        }
    }
}

export interface ToolsQuadrantsChartToolData {
    // tool ID
    id: string
    // tool name
    name: string
    // total usage
    usage_count: number
    satisfaction_percentage: number
    interest_percentage: number
    // nb of users of the tool
    x: number
    // retention or interest percentage, depends on the selected metric
    y: number
}

export interface ToolsQuadrantsChartToolsCategoryData {
    id: ToolsSectionId
    // translated name of the category
    name: string
    color: string
    data: ToolsQuadrantsChartToolData[]
}

export type ToolsQuadrantsMetric = 'retention' | 'interest'

export type ChartLayerProps = ScatterPlotLayerProps<ToolsQuadrantsChartToolData>

// Tool data after being processed by the chart
export interface NodeData {
    id: string
    categoryId: string
    name: string
    x: number
    y: number
    color: string
    opacity: number
    isHover: boolean
    labelOpacity: number
    labelOffset: number
    labelBackgroundOpacity: number
}

// Chart node animated props
export type NodeAnimatedProps = {
    x: number
    y: number
    opacity: number
    labelOpacity: number
    labelOffset: number
    labelBackgroundOpacity: number
}
