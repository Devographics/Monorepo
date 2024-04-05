import './Boxplot.scss'
import React, { useMemo, useRef } from 'react'
import { RowDataProps, ViewDefinition, ViewProps } from '../../types'
import { BAR_HEIGHT, Row, RowWrapper, Rows } from 'core/charts/common2'
import { BoxProps, HorizontalBox } from './Box'
import { RowCommonProps, RowExtraProps } from 'core/charts/common2/types'
import { useTheme } from 'styled-components'
import * as d3 from 'd3'
import AxisBottom from './Axis'
import { BlockLegend } from 'core/types'
import { useWidth } from 'core/charts/common2/helpers'
import { useBoxplotData, useScales } from './helpers'
import { formatValue } from '../../helpers/labels'
import { removeNoAnswer } from '../../helpers/steps'

const PIXEL_PER_TICKS = 130

const BoxplotView = (viewProps: ViewProps) => {
    const { chartState, chartValues } = viewProps
    const { question, facetQuestion } = chartValues
    const theme = useTheme()
    const { buckets } = viewProps
    const contentHeight = BAR_HEIGHT

    if (!facetQuestion) {
        return null
    }

    // note: we need the bottom axis to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef) || 0

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP10 = buckets.map(bucket => bucket.percentilesByFacet?.p10 || 0)

        const allP90 = buckets.map(bucket => bucket.percentilesByFacet?.p90 || 0)
        const [chartMin, chartMax] = [Math.min(...allP10), Math.max(...allP90)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax, groups }
    }, [buckets])

    const labelFormatter = (value: number) =>
        formatValue({ value, chartState, question: facetQuestion })

    const legends = [] as BlockLegend[]

    const { xScale, yScale } = useScales({ chartMax, contentHeight, contentWidth, groups })
    const rowProps = {
        ...viewProps,
        labelFormatter,
        chartMin,
        chartMax,
        groups,
        contentHeight,
        xScale,
        yScale,
        contentWidth
    }

    return (
        <div className="chart-boxplot-view">
            <Rows {...viewProps} hasZebra={true}>
                {buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...rowProps} rowComponent={BoxplotRow} />
                ))}
            </Rows>
            <div className="chart-axis-bottom">
                <div></div>
                <div className="chart-row-content" ref={contentRef}>
                    <svg className="boxplot-svg">
                        <AxisBottom
                            xScale={xScale}
                            pixelsPerTick={PIXEL_PER_TICKS}
                            labelFormatter={labelFormatter}
                            legends={legends}
                            stroke={theme.colors.text}
                        />
                    </svg>
                </div>
                <div></div>
            </div>
        </div>
    )
}

type BoxplotRowProps = {
    xScale: d3.ScaleLinear<number, number, never>
    yScale: d3.ScaleBand<string>
}

const BoxplotRow = (
    props: {
        labelFormatter: (v: number) => string
        contentWidth: number
    } & BoxplotRowProps &
        RowDataProps &
        RowCommonProps &
        RowExtraProps
) => {
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
        <RowWrapper {...props}>
            <svg style={{ height: BAR_HEIGHT }} className="boxplot-svg">
                <HorizontalBox {...boxProps} />
            </svg>
        </RowWrapper>
    )
}

export const Boxplot: ViewDefinition = {
    component: BoxplotView,
    steps: [removeNoAnswer]
}
