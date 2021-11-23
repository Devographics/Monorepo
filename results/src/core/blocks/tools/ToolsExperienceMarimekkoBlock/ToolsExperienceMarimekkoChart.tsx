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
    left: 160,
}
export const ROW_HEIGHT = 40

/**
 * Create a map of tool experience keys for easier access.
 */
const experienceKeys = keyBy(keys.tools.keys, 'id')

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
            {data.map((datum) => (
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
            {data.map((datum) => (
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

    const { current } = props
    
    // `id` is the label while `value` is the accessor
    // for a given dimension.
    const dimensions = useMemo(
        () => [
            {
                id: translate(experienceKeys.not_interested.label),
                value: experienceKeys.not_interested.id,
            },
            {
                id: translate(experienceKeys.would_not_use.label),
                value: experienceKeys.would_not_use.id,
            },
            {
                id: translate(experienceKeys.would_use.label),
                value: experienceKeys.would_use.id,
            },
            {
                id: translate(experienceKeys.interested.label),
                value: experienceKeys.interested.id,
            },
        ],
        [translate]
    )

    const theme = useTheme()


    const getLayerColor = (props: any) => {
        const dimension = dimensions.find((d) => d.id === props.id)
        if (dimension) {
            const color = theme.colors.ranges.tools[dimension.value]
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
                format: valueFormatter,
            }}
            axisBottom={{
                format: valueFormatter,
            }}
            id="id"
            value="awareness"
            valueFormat={valueFormatter}
            data={props.data}
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
                'bars',
            ]}
        />
    )
}
