import React from 'react'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { scaleLinear, scalePoint } from 'd3-scale'
import { line as d3Line, curveBasis } from 'd3-shape'
import { useTheme } from 'styled-components'
import { NegativePattern } from './NegativePattern'

interface RangesDeltaJoyPlotLegendProps {
    size: number
}

export const Legend = ({ size }: RangesDeltaJoyPlotLegendProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const legendPoints = [
        [0, 0],
        [1, 1],
        [2, 0],
        [3, -1],
        [4, 0],
    ]

    const legendXScale = scalePoint<number>()
        .domain([0, 1, 2, 3, 4])
        .range([0, size * 2])

    const legendYScale = scaleLinear<number>().domain([-1, 1]).range([size, -size])

    const interpolatedLegendPoints: [number, number][] = legendPoints.map((point) => {
        return [legendXScale(point[0]) as number, legendYScale(point[1])]
    })

    const legendLineGenerator = d3Line().curve(curveBasis)

    return (
        <g>
            <defs>
                <NegativePattern id="legendPattern" color={theme.colors.border} />
            </defs>
            <line x1={-size - 10} x2={size + 10} stroke={theme.colors.border} />
            <text
                x={-size - 20}
                dy={3}
                style={{
                    fill: theme.colors.text,
                    fontSize: 11,
                }}
                textAnchor="end"
            >
                {translate(`charts.ranges_multiple_diverging_lines.baseline`)}
            </text>
            <g transform={`translate(${-size}, 0)`}>
                <path
                    d={legendLineGenerator(interpolatedLegendPoints) ?? undefined}
                    stroke={theme.colors.border}
                    strokeWidth={2}
                    fill="url(#legendPattern)"
                    fillOpacity={0.1}
                />
                <path
                    d={legendLineGenerator(interpolatedLegendPoints) ?? undefined}
                    stroke={theme.colors.border}
                    strokeWidth={2}
                    fill={theme.colors.border}
                    fillOpacity={0.1}
                />
                <g transform={`translate(${legendXScale(1)}, ${legendYScale(0.45)})`}>
                    <circle r={3} fill={theme.colors.border} />
                    <line x2={legendXScale.step() * 1.5} stroke={theme.colors.border} />
                    <text
                        x={legendXScale.step() * 1.5 + 10}
                        dy={3}
                        style={{
                            fill: theme.colors.text,
                            fontSize: 11,
                        }}
                    >
                        {translate(`charts.ranges_multiple_diverging_lines.positive_offset`)}
                    </text>
                </g>
                <g transform={`translate(${legendXScale(3)}, ${legendYScale(-0.45)})`}>
                    <circle r={3} fill={theme.colors.border} />
                    <line x1={-legendXScale.step() * 1.5} stroke={theme.colors.border} />
                    <text
                        x={-legendXScale.step() * 1.5 - 10}
                        dy={3}
                        textAnchor="end"
                        style={{
                            fill: theme.colors.text,
                            fontSize: 11,
                        }}
                    >
                        {translate(`charts.ranges_multiple_diverging_lines.negative_offset`)}
                    </text>
                </g>
            </g>
        </g>
    )
}
