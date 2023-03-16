import React from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveStream } from '@nivo/stream'
import { isPercentage } from 'core/helpers/units'
import { useI18n } from 'core/i18n/i18nContext'

const Dot = ({ x, y, datum, current, units }) => {
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

const margin = {
    top: 0,
    right: 20,
    bottom: 40,
    left: 20
}

const getChartData = (data, units) => {
    return data.map(y => {
        const { year, buckets } = y
        const item = {
            id: year,
            year
        }
        buckets.forEach(b => {
            item[b.id] = b[units]
        })
        return item
    })
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
}) => {
    const theme = useTheme()
    const { getString } = useI18n()

    const horizontalAxis = {
        tickSize: 10,
        tickPadding: 6,
        format: i => {
            return data[i].year
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
    const chartData = getChartData(data, units)

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
