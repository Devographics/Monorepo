// @ts-ignore: we don't have typings for the variables
import { totalCountRounded } from 'Config/variables.yml'
import { ToolsScatterPlotMetric } from './types'

// Defines the variants available for the chart,
// those labels are picked depending on the `metric` property
// passed to the chart.
export const quadrantLabels: Record<ToolsScatterPlotMetric, string[]> = {
    satisfaction: ['assess', 'adopt', 'avoid', 'analyze'],
    interest: ['mainstream', 'next_big_thing', 'unknown', 'low_interest'],
}

export const staticProps = {
    containerStyle: { height: 600 },
    margin: { top: 20, right: 90, bottom: 70, left: 90 },
    nodeRadius: 7,
    nodeCaptureRadius: 16,
    formatPercentage: (value: number) => `${value}%`,
}

// base scales configuration when no quadrant is zoomed in.
export const baseScales = {
    // user count
    xRange: [0, totalCountRounded],
    // percentage
    yRange: [0, 100],
}

// ranges are expressed as values, not dimensions,
// dimensions are computed dynamically depending on x/y scales.
interface QuadrantConfig {
    color: string
    // regular x range (not zoomed)
    xRange: [number, number]
    // zoomed x range
    xZoomRange: [number, number]
    // regular y range (not zoomed)
    yRange: [number, number]
    // zoomed y range
    yZoomRange: [number, number]
}

// x offset when a quadrant is zoomed in, expressed as a value,
// the resulting offset is computed using the chart's xScale.
export const X_SCALE_VALUE_OFFSET = 500

// y offset when a quadrant is zoomed in, expressed as a value,
// the resulting offset is computed using the chart's yScale.
// Y being a percentage, the value should be between 0~100.
export const Y_SCALE_VALUE_OFFSET = 5

export const quadrantsConfig: QuadrantConfig[] = [
    // 'Assess' when using 'satisfaction' as a metric, top left
    {
        color: 'background',
        xRange: [0, totalCountRounded / 2],
        xZoomRange: [0, totalCountRounded / 2 + X_SCALE_VALUE_OFFSET],
        yRange: [100, 50],
        yZoomRange: [50 - Y_SCALE_VALUE_OFFSET, 100],
    },
    // 'Adopt' when using 'satisfaction' as a metric, top right
    {
        color: 'backgroundForeground',
        xRange: [totalCountRounded / 2, totalCountRounded],
        xZoomRange: [totalCountRounded / 2 - X_SCALE_VALUE_OFFSET, totalCountRounded],
        yRange: [100, 50],
        yZoomRange: [50 - Y_SCALE_VALUE_OFFSET, 100],
    },
    // 'Avoid' when using 'satisfaction' as a metric, bottom left
    {
        color: 'backgroundBackground',
        xRange: [0, totalCountRounded / 2],
        xZoomRange: [0, totalCountRounded / 2 + X_SCALE_VALUE_OFFSET],
        yRange: [50, 0],
        yZoomRange: [0, 50 + Y_SCALE_VALUE_OFFSET],
    },
    // 'Analyze' when using 'satisfaction' as a metric, bottom right
    {
        color: 'background',
        xRange: [totalCountRounded / 2, totalCountRounded],
        xZoomRange: [totalCountRounded / 2 -  X_SCALE_VALUE_OFFSET, totalCountRounded],
        yRange: [50, 0],
        yZoomRange: [0, 50 + Y_SCALE_VALUE_OFFSET],
    },
]

export const crosshair = {
    labelWidth: 70,
    labelHeight: 24,
    circleRadius: 14,
}

// This can be used to force the position of nodes' label.
export const forcedLabelPositions: Record<ToolsScatterPlotMetric, Record<string, [x: number, y: number]>> = {
    satisfaction: {
        halfmoon: [0, -15],
        primer: [0, -15],
        twin: [-40, 0],
    },
    interest: {
        'NW.js': [0, 5],
    },
}