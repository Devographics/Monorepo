import React from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveStream } from '@nivo/stream'
import { isPercentage } from 'core/helpers/units'
import { useI18n } from '@devographics/react-i18n'
import { BlockLegend } from 'core/types'
import {
    BucketUnits,
    ResponseEditionData,
    SectionAllToolsData,
    ToolQuestionData
} from '@devographics/types'

export const Dot = ({ x, y, datum, current, units }) => {
    if (current !== null && datum.key !== current) {
        return null
    }

    const availableHeight = datum.y1 - datum.y2
    if (availableHeight < 8 && current === null) return null

    let label = datum.value
    if (isPercentage(units)) {
        label = `${label}%`
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <rect fill={'rgba(255,255,255,0.7)'} x={-23} y={-11} width={46} height={22} r={16} />
            <text
                x={15}
                fill="#212424"
                textAnchor="end"
                alignmentBaseline="middle"
                style={{
                    fontSize: 11,
                    fontWeight: 600
                }}
            >
                {label}
            </text>
        </g>
    )
}

export const margin = {
    top: 0,
    right: 20,
    bottom: 40,
    left: 20
}

export type OpinionBucket = {
    id: number
    year: number
    '0'?: number
    '1'?: number
    '2'?: number
    '3'?: number
    '4'?: number
}

export const convertDataForStreamChart = (editionData: ResponseEditionData, units: BucketUnits) => {
    const { year, buckets } = editionData
    const item: OpinionBucket = {
        id: year,
        year
    }
    buckets.forEach(b => {
        const id = b.id as '0' | '1' | '2' | '3' | '4'
        item[id] = b[units]
    })
    return item as OpinionBucket
}

export const getChartData = (data: ToolQuestionData, units: BucketUnits) => {
    const chartData = data.responses.allEditions.map(editionData =>
        convertDataForStreamChart(editionData, units)
    )
    return chartData
}

export type StreamChartProps = {
    data: ToolQuestionData
    keys: any
    bucketKeys: any
    units: any
    className: any
    current: any
    colorScale: any
    applyEmptyPatternTo: any
    i18nNamespace: any
    showLabels: any
    showYears: any
    height: any
    legends: BlockLegend[]
}

const StreamChart = ({
    data,
    keys,
    bucketKeys,
    units,
    className,
    current,
    colorScale,
    applyEmptyPatternTo,
    i18nNamespace,
    showLabels = true,
    showYears = true,
    height = 260
}: StreamChartProps) => {
    const chartData = getChartData(data, units)
    const theme = useTheme()
    const { getString } = useI18n()

    const horizontalAxis = {
        tickSize: 10,
        tickPadding: 6,
        format: i => {
            return chartData[i].year
        }
    }

    const getLayerColor = props => {
        const { id } = props
        const color = bucketKeys.find(b => b.id === id)?.color
        if (current !== null && current !== id) {
            return `${color}33`
        }
        return color
    }

    return (
        <div style={{ height }}>
            <ResponsiveStream
                theme={{
                    ...theme.charts,
                    axis: theme.charts.streamTimelineAxis
                }}
                offsetType="expand"
                colors={getLayerColor}
                curve="monotoneX"
                margin={margin}
                keys={keys}
                data={chartData}
                enableGridX={false}
                enableGridY={false}
                axisLeft={null}
                axisTop={horizontalAxis}
                axisBottom={horizontalAxis}
                enableDots={showLabels}
                dotComponent={d => <Dot {...d} current={current} units={units} />}
                dotColor="inherit:brighter(0.6)"
                animate={false}
                label={({ id }) => {
                    const fullLabel = getString(`options.${i18nNamespace}.${id}`)?.t
                    const shortLabel = getString(`options.${i18nNamespace}.${id}.short`)?.t
                    return shortLabel ?? fullLabel
                }}
                valueFormat={v => {
                    return isPercentage(units) ? `${v}%` : v.toString()
                }}
                // defs={[theme.charts.emptyPattern]}
                // fill={[
                //     {
                //         match: {
                //             id: applyEmptyPatternTo
                //         },
                //         id: 'empty'
                //     }
                // ]}
                defs={bucketKeys.map(({ id, gradientColors }) => ({
                    id,
                    type: 'linearGradient',
                    colors: [
                        { offset: 0, color: gradientColors[0] },
                        { offset: 100, color: gradientColors[1] }
                    ]
                }))}
                fill={bucketKeys.map(({ id }) => ({ match: { id }, id }))}
            />
        </div>
    )
}

export default StreamChart
