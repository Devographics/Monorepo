import './Boxplot.scss'
import React, { useMemo, useRef } from 'react'
import { HorizontalBarViewDefinition, HorizontalBarViewProps, RowComponentProps } from '../../types'
import { Axis, RespondentCount } from 'core/charts/common2'
import { BoxProps, HorizontalBox } from './Box'
import { Tick } from 'core/charts/common2/types'
import { useTheme } from 'styled-components'
import * as d3 from 'd3'
import { BlockLegend } from 'core/types'
import { useWidth } from 'core/charts/common2/helpers'
import { useBoxplotData, useScales } from './helpers'
import { removeNoAnswer } from '../../helpers/steps'
import { BAR_HEIGHT, RowGroup } from '../../rows/RowGroup'
import { RowWrapper, Rows } from '../../rows'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'

const PIXEL_PER_TICKS = 100

// use a value slightly larger than max to leave margin for labels, etc. on right side of chart
const MAX_COEFF = 1.2

const BoxplotView = (viewProps: HorizontalBarViewProps) => {
    const { chartState, chartValues } = viewProps
    const { facetQuestion } = chartValues
    const theme = useTheme()
    const { buckets } = viewProps
    const contentHeight = BAR_HEIGHT

    if (!facetQuestion) {
        return null
    }

    const { viewDefinition } = chartState
    const { formatValue } = viewDefinition

    // note: we need a placeholder that's part of the grid/subgrid layout
    // to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef) || 0

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP10 = buckets.map(bucket => bucket.percentilesByFacet?.p10 || 0)

        const allP90 = buckets.map(bucket => bucket.percentilesByFacet?.p90 || 0)
        const [chartMin, chartMax] = [Math.min(...allP10), Math.max(...allP90)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax: chartMax * MAX_COEFF, groups }
    }, [buckets])

    const labelFormatter = (value: number) => formatValue(value, facetQuestion)

    const legends = [] as BlockLegend[]

    const { xScale, yScale } = useScales({ chartMax, contentHeight, contentWidth, groups })

    const range = xScale.range()

    const ticks: Tick[] = useMemo(() => {
        const width = range[1] - range[0]
        const numberOfTicksTarget = Math.floor(width / PIXEL_PER_TICKS)
        return xScale.ticks(numberOfTicksTarget).map(value => ({
            value,
            xOffset: xScale(value)
        }))
    }, [xScale])

    const rowProps = {
        ...viewProps,
        labelFormatter,
        chartMin,
        chartMax,
        groups,
        contentHeight,
        xScale,
        yScale,
        contentWidth,
        ticks
    }

    const axisProps = { ticks, formatValue, question: facetQuestion }

    return (
        <div className="chart-boxplot-view">
            <Rows {...viewProps} hasZebra={true}>
                <>
                    <div className="chart-row chart-subgrid chart-boxplot-placeholder">
                        <div className="chart-row-content" ref={contentRef} />
                    </div>

                    <Axis variant="top" {...axisProps} />

                    {buckets.map((bucket, i) => (
                        <RowGroup
                            key={bucket.id}
                            bucket={bucket}
                            {...rowProps}
                            rowComponent={BoxplotRow}
                            rowIndex={i}
                        />
                    ))}

                    <Axis variant="bottom" {...axisProps} />
                    {/* <div className="chart-axis chart-axis-bottom">
                        <div className="chart-row-content">
                            <BoxplotAxis
                                ticks={ticks}
                                labelFormatter={labelFormatter}
                                legends={legends}
                                stroke={theme.colors.text}
                                variant="bottom"
                            />
                        </div>
                    </div> */}
                </>
            </Rows>
        </div>
    )
}

type BoxplotRowProps = RowComponentProps & {
    labelFormatter: (v: number) => string
    contentWidth: number
    xScale: d3.ScaleLinear<number, number, never>
    yScale: d3.ScaleBand<string>
}

const BoxplotRow = (props: BoxplotRowProps) => {
    const { bucket, xScale, yScale, labelFormatter, contentWidth } = props

    const theme = useTheme()

    const boxData = useBoxplotData({ bucket, xScale, yScale })
    if (!bucket.percentilesByFacet || !boxData) {
        return null
    }

    const boxProps: BoxProps = {
        i18nNamespace: 'foo',
        percentilesData: bucket.percentilesByFacet,
        stroke: theme.colors.text,
        labelFormatter,
        bucket,
        rowHeight: BAR_HEIGHT,
        boxData,
        contentWidth
    }

    return (
        <RowWrapper {...props} rowMetadata={<RespondentCount count={bucket.count} />}>
            <svg style={{ height: BAR_HEIGHT }} className="boxplot-svg">
                <HorizontalBox {...boxProps} />
            </svg>
        </RowWrapper>
    )
}

export const Boxplot: HorizontalBarViewDefinition = {
    component: BoxplotView,
    getValue: b => 0,
    formatValue: formatQuestionValue,
    dataFilters: [removeNoAnswer]
}
