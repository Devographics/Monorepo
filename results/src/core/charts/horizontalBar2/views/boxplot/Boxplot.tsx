import './Boxplot.scss'
import React, { useMemo, useRef } from 'react'
import {
    HorizontalBarChartState,
    HorizontalBarViewDefinition,
    HorizontalBarViewProps,
    RowComponentProps
} from '../../types'
import { Axis, RespondentCount } from 'core/charts/common2'
import { BoxProps, HorizontalBox } from './Box'
import { Tick } from 'core/charts/common2/types'
import { useTheme } from 'styled-components'
import * as d3 from 'd3'
import { BlockLegend } from 'core/types'
import { useWidth } from 'core/charts/common2/helpers'
import { getDatasetValues, useBoxplotData, useTicks, useXScale, useYScale } from './helpers'
import { removeNoAnswer } from '../../helpers/steps'
import { BAR_HEIGHT, RowGroup } from '../../rows/RowGroup'
import { RowWrapper, Rows } from '../../rows'
import { formatQuestionValue } from 'core/charts/common2/helpers/format'
import { getViewDefinition } from '../../helpers/views'

const BoxplotView = (viewProps: HorizontalBarViewProps) => {
    const { chartState, chartValues, seriesMetadata } = viewProps
    const { facetQuestion } = chartValues
    const theme = useTheme()
    const { buckets, isReversed } = viewProps
    const contentHeight = BAR_HEIGHT

    if (!facetQuestion) {
        return null
    }

    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const { formatValue } = viewDefinition

    // note: we need a placeholder that's part of the grid/subgrid layout
    // to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef) || 0

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(
        () => getDatasetValues({ buckets, seriesMetadata }),
        [buckets]
    )

    const labelFormatter = (value: number) => formatValue(value, facetQuestion)

    const legends = [] as BlockLegend[]

    const xScale = useXScale({ chartMax, contentWidth })
    const yScale = useYScale({ contentHeight, groups })

    const ticks: Tick[] = useMemo(() => useTicks(xScale), [xScale])

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
        ticks,
        isReversed
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
    isReversed?: boolean
}

const BoxplotRow = (props: BoxplotRowProps) => {
    const { bucket, xScale, yScale, labelFormatter, contentWidth, isReversed = false } = props

    const theme = useTheme()

    const boxData = useBoxplotData({ bucket, xScale, yScale, isReversed })
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
        contentWidth,
        isReversed
    }

    return (
        <RowWrapper {...props} rowMetadata={<RespondentCount count={bucket.count} />}>
            <svg style={{ height: BAR_HEIGHT }} className="boxplot-svg">
                <HorizontalBox {...boxProps} />
            </svg>
        </RowWrapper>
    )
}

export const Boxplot: HorizontalBarViewDefinition<HorizontalBarChartState> = {
    component: BoxplotView,
    // this is used to calculate max values, so use p90 and not p50
    getValue: b => b.percentilesByFacet?.p90 || 0,
    formatValue: formatQuestionValue,
    dataFilters: [removeNoAnswer]
}
