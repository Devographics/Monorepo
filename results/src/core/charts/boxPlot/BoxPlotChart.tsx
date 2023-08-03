import React, { useMemo } from 'react'
import * as d3 from 'd3'
import { AxisLeft } from './AxisLeft'
import { AxisBottom } from './AxisBottomCategoric'
import { VerticalBox } from './VerticalBox'

// Takes an array of numbers and compute some summary statistics from it like quantiles, median..
// Those summary statistics are the info needed to draw a boxplot
export const getSummaryStats = (data: number[]) => {
    const sortedData = data.sort(function (a, b) {
        return a - b
    })

    const q1 = d3.quantile(sortedData, 0.25)
    const median = d3.quantile(sortedData, 0.5)
    const q3 = d3.quantile(sortedData, 0.75)

    if (!q3 || !q1 || !median) {
        return
    }

    const interQuantileRange = q3 - q1
    const min = q1 - 1.5 * interQuantileRange
    const max = q3 + 1.5 * interQuantileRange

    return { min, q1, median, q3, max }
}

const MARGIN = { top: 30, right: 30, bottom: 30, left: 50 }

type BoxplotProps = {
    width: number
    height: number
    data: { name: string; value: number }[]
}

export const Boxplot = ({ width, height, data }: BoxplotProps) => {
    // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
    const boundsWidth = width - MARGIN.right - MARGIN.left
    const boundsHeight = height - MARGIN.top - MARGIN.bottom

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const groups = [...new Set(data.map(d => d.name))]
        return { chartMin, chartMax, groups }
    }, [data])

    // Compute scales
    const yScale = d3.scaleLinear().domain([chartMin, chartMax]).range([boundsHeight, 0])
    const xScale = d3.scaleBand().range([0, boundsWidth]).domain(groups).padding(0.25)

    // Build the box shapes
    const allShapes = groups.map((group, i) => {
        const groupData = data.filter(d => d.name === group).map(d => d.value)
        const sumStats = getSummaryStats(groupData)

        if (!sumStats) {
            return null
        }

        const { min, q1, median, q3, max } = sumStats

        return (
            <g key={i} transform={`translate(${xScale(group)},0)`}>
                <VerticalBox
                    width={xScale.bandwidth()}
                    q1={yScale(q1)}
                    median={yScale(median)}
                    q3={yScale(q3)}
                    min={yScale(min)}
                    max={yScale(max)}
                    stroke="black"
                    fill={'#ead4f5'}
                />
            </g>
        )
    })

    return (
        <div>
            <svg width={width} height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
                >
                    {allShapes}
                    <AxisLeft yScale={yScale} pixelsPerTick={30} />
                    {/* X axis uses an additional translation to appear at the bottom */}
                    <g transform={`translate(0, ${boundsHeight})`}>
                        <AxisBottom xScale={xScale} />
                    </g>
                </g>
            </svg>
        </div>
    )
}
