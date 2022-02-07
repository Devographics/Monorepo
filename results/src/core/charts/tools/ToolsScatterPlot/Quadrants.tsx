import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { LayerProps } from './types'
import { useToolsScatterPlotContext } from './state'
import { quadrantLabels, quadrantsConfig } from './config'
import { Quadrant } from './Quadrant'

const useQuadrants = (xScale: LayerProps['xScale'], yScale: LayerProps['yScale']) => {
    const { metric } = useToolsScatterPlotContext()
    const { translate } = useI18n()
    const theme = useTheme()

    const quadrants = useMemo(() => [
        {
            x: xScale(quadrantsConfig[0].xRange[0]),
            y: yScale(quadrantsConfig[0].yRange[0]),
            width: xScale(quadrantsConfig[0].xRange[1]) - xScale(quadrantsConfig[0].xRange[0]),
            height: yScale(quadrantsConfig[0].yRange[1]) - yScale(quadrantsConfig[0].yRange[0]),
            color: theme.colors.background,
            label: translate!(`options.quadrant.${quadrantLabels[metric][0]}`),
        },
        {
            x: xScale(quadrantsConfig[1].xRange[0]),
            y: yScale(quadrantsConfig[1].yRange[0]),
            width: xScale(quadrantsConfig[1].xRange[1]) - xScale(quadrantsConfig[1].xRange[0]),
            height: yScale(quadrantsConfig[1].yRange[1]) - yScale(quadrantsConfig[1].yRange[0]),
            color: theme.colors.backgroundForeground,
            label: translate!(`options.quadrant.${quadrantLabels[metric][1]}`),
        },
        {
            x: xScale(quadrantsConfig[2].xRange[0]),
            y: yScale(quadrantsConfig[2].yRange[0]),
            width: xScale(quadrantsConfig[2].xRange[1]) - xScale(quadrantsConfig[2].xRange[0]),
            height: yScale(quadrantsConfig[2].yRange[1]) - yScale(quadrantsConfig[2].yRange[0]),
            color: theme.colors.backgroundBackground,
            label: translate!(`options.quadrant.${quadrantLabels[metric][2]}`),
        },
        {
            x: xScale(quadrantsConfig[3].xRange[0]),
            y: yScale(quadrantsConfig[3].yRange[0]),
            width: xScale(quadrantsConfig[3].xRange[1]) - xScale(quadrantsConfig[3].xRange[0]),
            height: yScale(quadrantsConfig[3].yRange[1]) - yScale(quadrantsConfig[3].yRange[0]),
            color: theme.colors.background,
            label: translate!(`options.quadrant.${quadrantLabels[metric][3]}`),
        },
    ], [xScale, yScale, theme, translate])

    return {
        metric,
        quadrants,
    }
}

export const Quadrants = ({
    innerWidth,
    innerHeight,
    xScale,
    yScale,
}: LayerProps) => {
    const { metric, quadrants } = useQuadrants(xScale, yScale)
    const { zoomedQuadrantIndex, toggleQuadrantZoom } = useToolsScatterPlotContext()

    return (
        <>
            <mask id="quadrantsMask">
                <rect
                    width={innerWidth}
                    height={innerHeight}
                    fill="white"
                />
            </mask>
            <g mask="url(#quadrantsMask)">
                {quadrants.map(({ x, y, width, height, color, label }, quadrantIndex) => (
                    <Quadrant
                        key={quadrantIndex}
                        metric={metric}
                        index={quadrantIndex}
                        label={label}
                        color={color}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        isZoomed={quadrantIndex === zoomedQuadrantIndex}
                        toggleZoom={toggleQuadrantZoom}
                    />
                ))}
            </g>
        </>
    )
}
