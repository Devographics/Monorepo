import React, { useMemo, useRef } from 'react'
import { RowDataProps, ViewDefinition, ViewProps } from '../../types'
import { Row, RowWrapper, Rows } from 'core/charts/common2'
import { HorizontalBox, HorizontalBoxProps } from './Box'
import { RowCommonProps, RowExtraProps } from 'core/charts/common2/types'
import { useTheme } from 'styled-components'
import * as d3 from 'd3'
import AxisBottom from './Axis'
import { BlockLegend } from 'core/types'
import { useWidth } from 'core/charts/common2/helpers'
import { useBoxplotData, useScales } from './helpers'

export const MARGIN = { top: 0, right: 120, bottom: 50, left: 120 }
export const ROW_HEIGHT = 60
export const PIXEL_PER_TICKS = 130
export const MIN_CHART_WIDTH = 600

const BoxplotView = (viewProps: ViewProps) => {
    const theme = useTheme()
    const { buckets } = viewProps
    const contentHeight = 50

    // note: we need the bottom axis to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef)

    // Compute everything derived from the dataset:
    const { chartMin, chartMax, groups } = useMemo(() => {
        // const [chartMin, chartMax] = d3.extent(data.map(d => d.value)) as [number, number]
        const allP10 = buckets.map(bucket => bucket.percentilesByFacet?.p10 || 0)

        const allP90 = buckets.map(bucket => bucket.percentilesByFacet?.p90 || 0)
        const [chartMin, chartMax] = [Math.min(...allP10), Math.max(...allP90)]
        const groups = [...new Set(buckets.map(bucket => bucket.id))]
        return { chartMin, chartMax, groups }
    }, [buckets])

    const labelFormatter = (s: string) => 'foo'
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
        contentWidth,
        rowComponent: BoxplotRow
    }

    return (
        <>
            <Rows>
                {buckets.map((bucket, i) => (
                    <Row key={bucket.id} bucket={bucket} {...rowProps} />
                ))}
            </Rows>
            <div className="chart-axis-bottom">
                <div></div>
                <div ref={contentRef}>
                    <svg width="100%">
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
        </>
    )
}

type BoxplotRowProps = {
    xScale: d3.ScaleLinear<number, number, never>
    yScale: d3.ScaleBand<string>
}

const BoxplotRow = (
    props: { labelFormatter: (s: string) => string; contentWidth: number } & BoxplotRowProps &
        RowDataProps &
        RowCommonProps &
        RowExtraProps
) => {
    const { bucket, xScale, yScale, labelFormatter, contentWidth } = props

    console.log(props)
    const theme = useTheme()

    const boxData = useBoxplotData({ bucket, xScale, yScale })
    if (!bucket.percentilesByFacet) {
        return null
    }

    const boxProps: HorizontalBoxProps = {
        i18nNamespace: 'foo',
        percentilesData: bucket.percentilesByFacet,
        stroke: theme.colors.text,
        labelFormatter,
        bucket,
        rowHeight: ROW_HEIGHT,
        boxData,
        contentWidth
    }

    return (
        <RowWrapper {...props}>
            <svg width="100%">
                <HorizontalBox {...boxProps} />
            </svg>
        </RowWrapper>
    )
}

export const Boxplot: ViewDefinition = {
    component: BoxplotView
}
