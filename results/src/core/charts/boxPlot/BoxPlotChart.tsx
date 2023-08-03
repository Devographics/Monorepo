import React, { useMemo } from 'react'
import * as d3 from 'd3'
import { AxisLeft } from './AxisLeft'
import { AxisBottom } from './AxisBottomCategoric'
import { VerticalBox } from './VerticalBox'
import { StandardQuestionData } from '@devographics/types'
import { useTheme } from 'styled-components'

export const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 }

type BoxplotProps = {
    width: number
    height: number
    data: { name: string; value: number }[]
}

export const getChartData = (data: StandardQuestionData) => data?.responses?.currentEdition.buckets

export const BoxPlotChart = ({
    legends,
    series,
    containerWidth = 500,
    height = 300
}: BoxplotProps) => {
    const width = containerWidth
    // by default this chart only receive one data series, but if it receives more
    // it can combine them into a single chart
    let buckets = getChartData(series[0].data)

    const theme = useTheme()

    console.log(buckets)
    // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
    const boundsWidth = width - MARGIN.right - MARGIN.left
    const boundsHeight = height - MARGIN.top - MARGIN.bottom

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP0 = buckets.map(bucket => bucket.percentilesByFacet?.p0 || 0)
        console.log(allP0)

        const allP100 = buckets.map(bucket => bucket.percentilesByFacet?.p100 || 0)
        const [chartMin, chartMax] = [Math.min(...allP0), Math.max(...allP100)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax, groups }
    }, [buckets])

    console.log({ chartMin, chartMax, groups })

    // Compute scales
    const yScale = d3.scaleLinear().domain([chartMin, chartMax]).range([boundsHeight, 0])
    const xScale = d3.scaleBand().range([0, boundsWidth]).domain(groups).padding(0.25)

    // Build the box shapes
    const allShapes = buckets.map((bucket, i) => {
        if (!bucket.percentilesByFacet) {
            throw new Error(
                `BoxPlotChart: could not find percentilesByFacet for bucket ${bucket.id}`
            )
        }

        const { p0, p25, p50, p75, p100 } = bucket.percentilesByFacet

        return (
            <g key={i} transform={`translate(${xScale(bucket.id)},0)`}>
                <VerticalBox
                    width={xScale.bandwidth()}
                    p25={yScale(p25)}
                    p50={yScale(p50)}
                    p75={yScale(p75)}
                    p0={yScale(p0)}
                    p100={yScale(p100)}
                    stroke={theme.colors.text}
                    // fill={'#ead4f5'}
                />
            </g>
        )
    })

    return (
        <div>
            <svg width="100%" height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
                >
                    {allShapes}
                    <AxisLeft
                        width={boundsWidth}
                        yScale={yScale}
                        pixelsPerTick={30}
                        stroke={theme.colors.text}
                    />
                    {/* X axis uses an additional translation to appear at the bottom */}
                    <g transform={`translate(0, ${boundsHeight})`}>
                        <AxisBottom xScale={xScale} legends={legends} stroke={theme.colors.text} />
                    </g>
                </g>
            </svg>
        </div>
    )
}
