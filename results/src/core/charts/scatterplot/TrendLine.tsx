import React from 'react'
import { useTheme } from 'styled-components'
import { ScatterplotChartValues } from './chartValues'
import { NodeData } from './types'

export type Regression = {
    slope: number
    intercept: number
    // coefficient of determination, 0~1
    r2: number
}

/**
 * Ordinary least-squares linear regression over a set of (x, y) points.
 * Returns null when a line can't be fitted (fewer than 2 points, or no
 * variance along x).
 */
export const computeRegression = (points: { x: number; y: number }[]): Regression | null => {
    const n = points.length
    if (n < 2) return null

    const meanX = points.reduce((acc, p) => acc + p.x, 0) / n
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n

    let ssXX = 0
    let ssYY = 0
    let ssXY = 0
    for (const p of points) {
        const dx = p.x - meanX
        const dy = p.y - meanY
        ssXX += dx * dx
        ssYY += dy * dy
        ssXY += dx * dy
    }

    // no spread along x means a vertical line, which can't be expressed as y = mx + b
    if (ssXX === 0) return null

    const slope = ssXY / ssXX
    const intercept = meanY - slope * meanX
    // r² = (ssXY)² / (ssXX · ssYY); when y has no spread the fit is trivially perfect
    const r2 = ssYY === 0 ? 1 : (ssXY * ssXY) / (ssXX * ssYY)

    return { slope, intercept, r2 }
}

type TrendLineProps = {
    chartValues: ScatterplotChartValues
    nodes: NodeData[]
}

// draw an ordinary least-squares regression line (with R²) through the points
export const TrendLine = ({ chartValues, nodes }: TrendLineProps) => {
    const theme = useTheme()
    const { xScale, yScale } = chartValues

    const points = nodes.map(node => ({ x: node.xValue, y: node.yValue }))
    const regression = computeRegression(points)
    if (!regression) return null

    const { slope, intercept, r2 } = regression

    // draw the line across the span of the actual data, not the padded chart bounds
    const xValues = points.map(p => p.x)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)

    const x1 = xScale(xMin)
    const y1 = yScale(slope * xMin + intercept)
    const x2 = xScale(xMax)
    const y2 = yScale(slope * xMax + intercept)

    return (
        <g className="scatterplot-trendline-group">
            <line
                className="scatterplot-trendline"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.colors.text}
                strokeWidth={2}
                strokeDasharray="6 4"
                opacity={0.7}
            />
        </g>
    )
}
