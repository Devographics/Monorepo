import { ScatterPlotLayerProps } from '@nivo/scatterplot'
import { ToolsSectionId } from 'core/bucket_keys'

export interface ToolsScatterPlotTool {
    // tool ID
    id: string
    originalId: string
    name: string
    label: string
    usage_count: number
    // same as `usage_count`
    x: number
    satisfaction_percentage: number
    // same as `satisfaction_percentage`
    y: number
    interest_percentage: number
}

export type ToolsScatterPlotMetric = 'satisfaction' | 'interest'

export interface ToolsScatterPlotSeries {
    id: ToolsSectionId
    // category name (translated)
    name: string
    // category color
    color: string
    // category tools
    data: ToolsScatterPlotTool[]
}

export type LayerProps = ScatterPlotLayerProps<ToolsScatterPlotTool>

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

export type NodeAnimatedProps = {
    x: number
    y: number
    opacity: number
    labelOpacity: number
    labelOffset: number
    labelBackgroundOpacity: number
}
