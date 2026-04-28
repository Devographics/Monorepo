import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { ChartLayerProps } from '../types'
import { quadrantLabels, quadrantsConfig } from './config'
import { Quadrant } from './Quadrant'
import { ScatterplotChartState } from './chartState'

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
