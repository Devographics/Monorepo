import React from 'react'
import { useTheme } from 'styled-components'
import { DataFormatter } from '@nivo/core'
import { keyBy } from 'lodash'
import { ResponsiveMarimekko, CustomLayerProps } from '@nivo/marimekko'
import { ToolsExperienceMarimekkoToolData } from './types'
import { ToolsExperienceMarimekkoLegend } from './ToolsExperienceMarimekkoLegend'
import ToolLabel from 'src/not_used/charts/tools/ToolLabel'
import { SectionAllToolsData } from '@devographics/types'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import { ToolQuestionData, Entity } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'
import { BlockLegend } from 'core/types'

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
                        <ToolLabel id={datum.id} data={datum} entity={datum?.data?.tool} />
                    </foreignObject>
                </g>
            ))}
        </g>
    )
}

/**
 * Convert raw API data to be compatible with nivo Marimekko chart.
 *
 * We also have to recompute the percentages as those returned by
 * the API are global, for this chart awareness is represented
 * using the thickness of the bars, so we want percentages relative
 * to awareness only.
 */
export const getChartData = ({
    data,
    entities,
    makeAbsolute = false
}: {
    data: ToolQuestionData[]
    makeAbsolute?: boolean
    entities: Entity[]
}): ToolsExperienceMarimekkoToolData[] => {
    let chartData = data.map(tool => {
        const keyedBuckets = keyBy(tool.responses.currentEdition.buckets, 'id')
        const total = tool.responses.currentEdition.completion.total
        const neverheard = keyedBuckets?.never_heard?.count || 0
        const aware = total - neverheard

        const coeff = makeAbsolute ? 1 : -1
        const entity = entities.find(e => e.id === tool.id) || ({} as Entity)
        const toolData = {
            id: tool.id,
            entity,
            tool: { ...entity, id: tool.id },
            awareness: aware,
            would_not_use_percentage: round(
                ((keyedBuckets?.would_not_use?.count || 0) / aware) * 100 * coeff,
                1
            ),
            not_interested_percentage: round(
                ((keyedBuckets?.not_interested?.count || 0) / aware) * 100 * coeff,
                1
            ),
            interested_percentage: round(((keyedBuckets?.interested?.count || 0) / aware) * 100, 1),
            would_use_percentage: round(((keyedBuckets?.would_use?.count || 0) / aware) * 100, 1)
        }
        return toolData
    })

    // tools with the most positive experience come first,
    // interested users and users willing to use it again
    chartData = sortBy(chartData, datum => datum.interested_percentage + datum.would_use_percentage)
    chartData.reverse()

    return chartData
}

interface ToolsExperienceMarimekkoChartProps {
    data: SectionAllToolsData
    current: string | null
    legends: BlockLegend[]
}

export const ToolsExperienceMarimekkoChart = (props: ToolsExperienceMarimekkoChartProps) => {
    const entities = useEntities()

    const { current, data, legends } = props

    const chartData = getChartData({ data: data.items, entities })

    // `id` is the label while `value` is the accessor
    // for a given dimension.
    const dimensions = legends.map(legend => ({
        id: legend.label,
        originalId: legend.id,
        value: `${legend.id}_percentage`
    }))

    const theme = useTheme()

    const getLayerColor = (props: any) => {
        const dimension = dimensions.find(d => d.id === props.id)
        if (dimension) {
            const color = theme.colors.ranges.tools?.[dimension.originalId]?.[0]
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
            data={chartData}
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
            defs={legends.map(({ id, gradientColors }) => ({
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
            fill={legends.map(({ id }) => ({
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
