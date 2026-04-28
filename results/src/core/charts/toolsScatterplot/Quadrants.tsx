/**
 * Not currently used
 */

import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { ChartLayerProps } from './types'
import { Quadrant } from './Quadrant'
import { ScatterplotChartState } from './chartState'

// todo: not using this anymore
const totalCountRounded = 9999

// Defines the variants available for the chart,
// those labels are picked depending on the `metric` property
// passed to the chart.
export const quadrantLabels: Record<ToolsQuadrantsMetric, string[]> = {
    // satisfaction: ['assess', 'adopt', 'avoid', 'analyze'],
    // interest: ['mainstream', 'next_big_thing', 'unknown', 'low_interest'],
    satisfaction: ['1', '2', '3', '4'],
    interest: ['1', '2', '3', '4']
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
        yZoomRange: [50 - Y_SCALE_VALUE_OFFSET, 100]
    },
    // 'Adopt' when using 'satisfaction' as a metric, top right
    {
        color: 'backgroundForeground',
        xRange: [totalCountRounded / 2, totalCountRounded],
        xZoomRange: [totalCountRounded / 2 - X_SCALE_VALUE_OFFSET, totalCountRounded],
        yRange: [100, 50],
        yZoomRange: [50 - Y_SCALE_VALUE_OFFSET, 100]
    },
    // 'Avoid' when using 'satisfaction' as a metric, bottom left
    {
        color: 'backgroundBackground',
        xRange: [0, totalCountRounded / 2],
        xZoomRange: [0, totalCountRounded / 2 + X_SCALE_VALUE_OFFSET],
        yRange: [50, 0],
        yZoomRange: [0, 50 + Y_SCALE_VALUE_OFFSET]
    },
    // 'Analyze' when using 'satisfaction' as a metric, bottom right
    {
        color: 'background',
        xRange: [totalCountRounded / 2, totalCountRounded],
        xZoomRange: [totalCountRounded / 2 - X_SCALE_VALUE_OFFSET, totalCountRounded],
        yRange: [50, 0],
        yZoomRange: [0, 50 + Y_SCALE_VALUE_OFFSET]
    }
]

const useQuadrants = (
    chartState: ScatterplotChartState,
    xScale: ChartLayerProps['xScale'],
    yScale: ChartLayerProps['yScale']
) => {
    const { yMetric } = chartState
    const { translate } = useI18n()
    const theme = useTheme()

    return useMemo(
        () => [
            {
                x: xScale(quadrantsConfig[0].xRange[0]),
                y: yScale(quadrantsConfig[0].yRange[0]),
                width: xScale(quadrantsConfig[0].xRange[1]) - xScale(quadrantsConfig[0].xRange[0]),
                height: yScale(quadrantsConfig[0].yRange[1]) - yScale(quadrantsConfig[0].yRange[0]),
                color: theme.colors.background,
                label: translate(`options.quadrant.${quadrantLabels[yMetric][0]}`)
            },
            {
                x: xScale(quadrantsConfig[1].xRange[0]),
                y: yScale(quadrantsConfig[1].yRange[0]),
                width: xScale(quadrantsConfig[1].xRange[1]) - xScale(quadrantsConfig[1].xRange[0]),
                height: yScale(quadrantsConfig[1].yRange[1]) - yScale(quadrantsConfig[1].yRange[0]),
                color: theme.colors.backgroundForeground,
                label: translate(`options.quadrant.${quadrantLabels[yMetric][1]}`)
            },
            {
                x: xScale(quadrantsConfig[2].xRange[0]),
                y: yScale(quadrantsConfig[2].yRange[0]),
                width: xScale(quadrantsConfig[2].xRange[1]) - xScale(quadrantsConfig[2].xRange[0]),
                height: yScale(quadrantsConfig[2].yRange[1]) - yScale(quadrantsConfig[2].yRange[0]),
                color: theme.colors.backgroundBackground,
                label: translate(`options.quadrant.${quadrantLabels[yMetric][2]}`)
            },
            {
                x: xScale(quadrantsConfig[3].xRange[0]),
                y: yScale(quadrantsConfig[3].yRange[0]),
                width: xScale(quadrantsConfig[3].xRange[1]) - xScale(quadrantsConfig[3].xRange[0]),
                height: yScale(quadrantsConfig[3].yRange[1]) - yScale(quadrantsConfig[3].yRange[0]),
                color: theme.colors.background,
                label: translate(`options.quadrant.${quadrantLabels[yMetric][3]}`)
            }
        ],
        [xScale, yScale, theme, translate, yMetric]
    )
}

type QuadrantsProps = {
    chartState: ScatterplotChartState
    innerWidth: number
    innerHeight: number
    xScale: any
    yScale: any
}

export const Quadrants = ({
    chartState,
    innerWidth,
    innerHeight,
    xScale,
    yScale
}: QuadrantsProps) => {
    const quadrants = useQuadrants(chartState, xScale, yScale)

    return (
        <>
            <mask id="quadrantsMask">
                <rect width={innerWidth} height={innerHeight} fill="white" />
            </mask>
            <g mask="url(#quadrantsMask)">
                {quadrants.map(({ x, y, width, height, color, label }, quadrantIndex) => (
                    <Quadrant
                        key={quadrantIndex}
                        quadrantIndex={quadrantIndex}
                        label={label}
                        color={color}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        chartState={chartState}
                    />
                ))}
            </g>
        </>
    )
}
