import React from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveStream } from '@nivo/stream'
import { isPercentage } from 'core/helpers/units'
import { useI18n } from 'core/i18n/i18nContext'
import {
    Dot,
    margin,
    StreamChartProps,
    convertDataForStreamChart
} from 'core/charts/toolsSectionStreams/ToolFeatureStreamChart'
import { BucketUnits, EditionData, OpinionQuestionData } from '@devographics/types'

export const getChartData = (data: OpinionQuestionData, units: BucketUnits) => {
    const chartData = data.responses.allEditions
    // for opinions only having one year of data, we duplicate the year's data
    // to be able to use the stream chart.
    // chartData = chartData.length > 1 ? chartData : [chartData[0], chartData[0]]
    return chartData.map(editionData => convertDataForStreamChart(editionData, units))
}

const OpinionStreamChart = ({
    data,
    units,
    current,
    i18nNamespace,
    showLabels = true,
    height = 260,
    legends
}: StreamChartProps) => {
    const chartData = getChartData(data, units)
    const theme = useTheme()
    const { getString } = useI18n()

    const horizontalAxis = {
        tickSize: 10,
        tickPadding: 6,
        format: i => {
            return chartData[i]?.year
        }
    }

    const getLayerColor = props => {
        const { id } = props
        const color = legends.find(b => b.id === String(id))?.color
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
                keys={['1', '2', '3', '4']} // TODO add back "0"!
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
                defs={legends.map(({ id, gradientColors }) => ({
                    id,
                    type: 'linearGradient',
                    colors: [
                        { offset: 0, color: gradientColors[0] },
                        { offset: 100, color: gradientColors[1] }
                    ]
                }))}
                fill={legends.map(({ id }) => ({ match: { id }, id }))}
            />
        </div>
    )
}

export default OpinionStreamChart
