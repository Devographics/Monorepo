import React, { useMemo } from 'react'
import * as d3 from 'd3'
import { Bucket, QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { useTheme } from 'styled-components'
import { useChartLabelFormatter } from '../hooks'
import { HorizontalBox, HorizontalBoxProps } from './HorizontalBox'
import AxisLeft from './AxisLeft'
import AxisBottom from './AxisBottom'
import sortBy from 'lodash/sortBy'
import { HorizontalBarChartProps } from '../horizontalBar/HorizontalBarChart'

export const MARGIN = { top: 0, right: 120, bottom: 200, left: 120 }

interface BoxplotProps extends HorizontalBarChartProps {
    containerWidth?: number
}

export const getChartData = (data: StandardQuestionData) =>
    data?.responses?.currentEdition.buckets ||
    data?.combined?.currentEdition.buckets ||
    data?.freeform?.currentEdition.buckets

const sortChartData = (buckets: Bucket[], question?: QuestionMetadata) =>
    question?.optionsAreSequential
        ? buckets
        : [...sortBy(buckets, b => b.percentilesByFacet?.p50)].reverse()

const ROW_HEIGHT = 60
const PIXEL_PER_TICKS = 130
const MIN_CHART_WIDTH = 600

export const HorizontalBoxPlotChart = ({
    legends,
    series,
    containerWidth = 0,
    units,
    facet,
    i18nNamespace,
    question
}: BoxplotProps) => {
    // by default this chart only receive one data series, but if it receives more
    // it can combine them into a single chart
    let buckets = getChartData(series[0].data)
    buckets = sortChartData(buckets, question)
    const labelFormatter = useChartLabelFormatter({ units, facet })

    const theme = useTheme()

    const contentHeight = (buckets?.length || 0) * ROW_HEIGHT
    const chartHeight = contentHeight + MARGIN.top + MARGIN.bottom

    const chartWidth = Math.max(containerWidth, MIN_CHART_WIDTH)
    const contentWidth = chartWidth - MARGIN.left - MARGIN.right

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP10 = buckets.map(bucket => bucket.percentilesByFacet?.p10 || 0)

        const allP90 = buckets.map(bucket => bucket.percentilesByFacet?.p90 || 0)
        const [chartMin, chartMax] = [Math.min(...allP10), Math.max(...allP90)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax, groups }
    }, [buckets])

    const xScale = d3.scaleLinear().domain([0, chartMax]).range([0, contentWidth])
    const yScale = d3.scaleBand().range([0, contentHeight]).domain(groups).padding(0.25)

    // Build the box shapes
    const allShapes = buckets
        .filter(bucket => bucket.percentilesByFacet)
        .map((bucket, i) => {
            if (!bucket.percentilesByFacet) {
                return null
            }
            const { p0, p10, p25, p50, p75, p90, p100 } = bucket.percentilesByFacet

            const boxData = {
                p0: xScale(p0),
                p10: xScale(p10),
                p25: xScale(p25),
                p50: xScale(p50),
                p75: xScale(p75),
                p90: xScale(p90),
                p100: xScale(p100)
            }

            const props: HorizontalBoxProps = {
                i18nNamespace,
                boxData,
                contentWidth,
                percentilesData: bucket.percentilesByFacet,
                stroke: theme.colors.text,
                labelFormatter,
                bucket,
                rowHeight: ROW_HEIGHT
            }

            return (
                <g key={i} transform={`translate(0,${yScale(bucket.id)})`}>
                    <HorizontalBox {...props} />
                </g>
            )
        })

    return (
        <div>
            <svg width={chartWidth} height={chartHeight}>
                <g
                    width={chartWidth}
                    height={contentHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
                >
                    <AxisLeft
                        contentWidth={contentWidth}
                        yScale={yScale}
                        pixelsPerTick={30}
                        labelFormatter={labelFormatter}
                        legends={legends}
                        stroke={theme.colors.text}
                        rowHeight={ROW_HEIGHT}
                        i18nNamespace={i18nNamespace}
                        buckets={buckets}
                    />
                    {/* X axis uses an additional translation to appear at the bottom */}
                    <g transform={`translate(0, ${contentHeight})`}>
                        <AxisBottom
                            xScale={xScale}
                            pixelsPerTick={PIXEL_PER_TICKS}
                            labelFormatter={labelFormatter}
                            legends={legends}
                            stroke={theme.colors.text}
                        />
                    </g>
                    {allShapes}
                </g>
            </svg>
        </div>
    )
}

export default HorizontalBoxPlotChart
