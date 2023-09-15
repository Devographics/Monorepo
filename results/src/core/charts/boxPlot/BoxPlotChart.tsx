import React, { useMemo } from 'react'
import * as d3 from 'd3'
import { AxisLeft } from './AxisLeft'
import { AxisBottom } from './AxisBottom'
import { BoxProps, VerticalBox } from './VerticalBox'
import { StandardQuestionData } from '@devographics/types'
import { useTheme } from 'styled-components'
import { useChartLabelFormatter } from '../hooks'
import { VerticalBarChartProps } from '../verticalBar/VerticalBarChart'
import { HorizontalBox } from './HorizontalBox'

export const MARGIN = { top: 30, right: 30, bottom: 50, left: 100 }

interface BoxplotProps extends VerticalBarChartProps {
    variant: 'horizontal' | 'vertical'
    //width?: number
    containerWidth?: number
    height?: number
    //data: { name: string; value: number }[]
}

export const getChartData = (data: StandardQuestionData) => data?.responses?.currentEdition.buckets

export const BoxPlotChart = ({
    variant = 'vertical',
    legends,
    series,
    containerWidth = 500,
    height: height_ = 300,
    units,
    facet
}: BoxplotProps) => {
    const width = containerWidth
    // by default this chart only receive one data series, but if it receives more
    // it can combine them into a single chart
    const buckets = getChartData(series[0].data)

    const labelFormatter = useChartLabelFormatter({ units, facet })

    const theme = useTheme()

    const height = variant === 'vertical' ? height_ : (legends?.length || 0) * 50

    // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
    const boundsWidth = width - MARGIN.right - MARGIN.left
    const boundsHeight = height - MARGIN.top - MARGIN.bottom

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP0 = buckets.map(bucket => bucket.percentilesByFacet?.p0 || 0)

        const allP100 = buckets.map(bucket => bucket.percentilesByFacet?.p100 || 0)
        const [chartMin, chartMax] = [Math.min(...allP0), Math.max(...allP100)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax, groups }
    }, [buckets])

    // Compute scales
    let yScale = d3.scaleLinear().domain([chartMin, chartMax]).range([boundsHeight, 0])
    let xScale = d3.scaleBand().range([0, boundsWidth]).domain(groups).padding(0.25)
    if (variant === 'horizontal') {
        yScale = d3.scaleLinear().domain([0, groups.length]).range([0, boundsHeight])
        xScale = d3.scaleBand().range([chartMin, chartMax]).domain(groups).padding(0.25)
    }

    const BoxComponent = variant === 'vertical' ? VerticalBox : HorizontalBox

    // Build the box shapes
    const allShapes = buckets
        .filter(bucket => bucket.percentilesByFacet)
        .map((bucket, i) => {
            if (!bucket.percentilesByFacet) {
                return null
            }
            const { p0, p25, p50, p75, p100 } = bucket.percentilesByFacet

            // TODO: p1/p99 is less sensitive to outliers than p100 (=max) and p0 (=min)
            // and could be oprefered for a box chart
            const boxData =
                variant === 'vertical'
                    ? {
                          p25: yScale(p25),
                          p50: yScale(p50),
                          p75: yScale(p75),
                          p0: yScale(p0),
                          p100: yScale(p100)
                      }
                    : {
                          p25: xScale(p25),
                          p50: xScale(p50),
                          p75: xScale(p75),
                          p0: xScale(p0),
                          p100: xScale(p100)
                      }

            const props: BoxProps = {
                ...boxData,
                stroke: theme.colors.text,
                label: String(labelFormatter(p50))
            }

            if (variant === 'vertical') {
                props.width = xScale.bandwidth()
            } else {
                props.height = 30
            }
            return (
                <g key={i} transform={`translate(${xScale(bucket.id)},0)`}>
                    <BoxComponent {...props} />
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
                        labelFormatter={labelFormatter}
                        legends={legends}
                        stroke={theme.colors.text}
                    />
                    {/* X axis uses an additional translation to appear at the bottom */}
                    <g transform={`translate(0, ${boundsHeight})`}>
                        <AxisBottom
                            xScale={xScale}
                            labelFormatter={labelFormatter}
                            legends={legends}
                            stroke={theme.colors.text}
                        />
                    </g>
                </g>
            </svg>
        </div>
    )
}
