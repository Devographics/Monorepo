// @ts-ignore
import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { DataFormatter } from '@nivo/core'
import { keyBy } from 'lodash'
import { ResponsiveMarimekko, CustomLayerProps } from '@nivo/marimekko'
import { keys } from 'core/bucket_keys'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { ToolsExperienceMarimekkoToolData } from './types'
import { ToolsExperienceMarimekkoLegend } from './ToolsExperienceMarimekkoLegend'
// @ts-ignore
import ToolLabel from 'core/charts/tools/ToolLabel'

export const MARGIN = {
    top: 30,
    right: 10,
    bottom: 120,
    left: 160
}
export const ROW_HEIGHT = 40

/**
 * In order to create a diverging chart (<– negative | positive –>),
 * we have to use negative and positive values, that's why we're using
 * this formatter, also to add a `%` sign to values.
 */
const valueFormatter = ((value: number) => `${Math.abs(Math.round(value))}%`) as DataFormatter

/**
 * Add a shadow behind each tool bars.
 */
const ShadowsLayer = ({ data }: CustomLayerProps<ToolsExperienceMarimekkoToolData>) => {
    return (
        <g>
            {data.map(datum => (
                <rect
                    key={datum.id}
                    x={datum.x - 4}
                    y={datum.y + 7}
                    width={datum.width}
                    height={datum.height}
                    fill="rgba(0, 0, 0, .5)"
                />
            ))}
        </g>
    )
}

/**
 * Extra layer to add tool names.
 */
const ToolsLabels = ({ data }: CustomLayerProps<ToolsExperienceMarimekkoToolData>) => {
    return (
        <g>
            {data.map(datum => (
                <g key={datum.id} transform={`translate(-160, ${datum.y})`}>
                    <foreignObject style={{ overflow: 'visible' }} width="1" height="1">
                        <ToolLabel id={datum.id} data={datum} />
                    </foreignObject>
                </g>
            ))}
        </g>
    )
}

interface ToolsExperienceMarimekkoChartProps {
    data: ToolsExperienceMarimekkoToolData[]
    current: string | null
}

export const ToolsExperienceMarimekkoChart = (props: ToolsExperienceMarimekkoChartProps) => {
    const { translate } = useI18n()

    const { current, data, colorMapping } = props

    // `id` is the label while `value` is the accessor
    // for a given dimension.
    const dimensions = keys.tools.keys.map(k => ({
        id: translate(k.label),
        originalId: k.id,
        value: `${k.id}_percentage`
    }))

    const theme = useTheme()

    const getLayerColor = (props: any) => {
        const dimension = dimensions.find(d => d.id === props.id)
        if (dimension) {
            const color = theme.colors.ranges.tools[dimension.originalId][0]
            if (current !== null && current !== props.datum.id) {
                return `${color}33`
            }
            return color
        } else {
            return 'blue'
        }
    }

    return (
        <ResponsiveMarimekko<ToolsExperienceMarimekkoToolData>
            margin={MARGIN}
            axisTop={{
                format: valueFormatter
            }}
            axisBottom={{
                format: valueFormatter
            }}
            id="id"
            value="awareness"
            valueFormat={valueFormatter}
            data={data}
            dimensions={dimensions}
            theme={theme.charts}
            colors={getLayerColor}
            enableGridX
            enableGridY={false}
            offset="diverging"
            layout="horizontal"
            animate={true}
            motionConfig="default"
            innerPadding={3}
            outerPadding={7}
            layers={[
                ({ bars }) => (
                    <g
                        transform={`translate(${bars[2].x}, ${
                            bars[bars.length - 1].y + bars[bars.length - 1].height + 60
                        })`}
                    >
                        <ToolsExperienceMarimekkoLegend colors={theme.colors.ranges.tools} />
                    </g>
                ),
                'grid',
                'axes',
                // ShadowsLayer,
                ToolsLabels,
                'bars'
            ]}
            defs={colorMapping.map(({ id, gradientColors }) => ({
                id,
                type: 'linearGradient',
                x1: 0,
                y1: 1,
                x2: 1,
                y2: 1,
                colors: [
                    { offset: 0, color: gradientColors[0] },
                    { offset: 100, color: gradientColors[1] }
                ]
            }))}
            fill={colorMapping.map(({ id }) => ({
                // labels of the form tailwind_css-Used it > Would not use again
                match: ({ key }) => {
                    const label = key.split('-')[1]
                    return labelsLookup[label] === id
                },
                id
            }))}
        />
    )
}

const labelsLookup = {
    'Used it > Would not use again': 'would_not_use',
    'Heard of it > Not interested': 'not_interested',
    'Used it > Would use again': 'would_use',
    'Heard of it > Would like to learn': 'interested',
    'Never heard of it/Not sure what it is': 'never_heard'
}
