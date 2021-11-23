import React from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveStream } from '@nivo/stream'

const Dot = ({ x, y, datum, current, units }) => {
    if (current !== null && datum.key !== current) {
        return null
    }

    const availableHeight = datum.y1 - datum.y2
    if (availableHeight < 8 && current === null) return null

    let label = datum.value
    if (units === 'percentage') {
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
                    fontWeight: 600,
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
    left: 20,
}

const getChartData = (data, units) => {
    return data.map((y) => {
        const { year, buckets } = y
        const item = {
            id: year,
        }
        buckets.forEach((b) => {
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
    showLabels = true,
    showYears = true,
    height = 260,
}) => {
    const theme = useTheme()

    const horizontalAxis = {
        tickSize: 10,
        tickPadding: 6,
        format: (i) => data[i].year,
    }

    let tooltipFormat
    if (units === 'percentage') {
        tooltipFormat = (d) => `${d}%`
    }

    const getLayerColor = ({ index }) => {
        if (current !== null && current !== keys[index]) {
            return `${colorScale[index]}33`
        }
        return colorScale[index]
    }

    return (
        <div style={{ height }}>
            <ResponsiveStream
                theme={{
                    ...theme.charts,
                    axis: theme.charts.streamTimelineAxis,
                }}
                offsetType="expand"
                colors={getLayerColor}
                curve="monotoneX"
                margin={margin}
                keys={keys}
                data={getChartData(data, units)}
                enableGridX={false}
                enableGridY={false}
                axisLeft={undefined}
                axisTop={horizontalAxis}
                axisBottom={horizontalAxis}
                enableDots={showLabels}
                dotComponent={(d) => <Dot {...d} current={current} units={units} />}
                dotColor="inherit:brighter(0.6)"
                animate={false}
                tooltipLabel={(d) => {
                    const key = bucketKeys.find((key) => key.id === d.id)
                    return key.shortLabel || key.label
                }}
                tooltipFormat={tooltipFormat}
                defs={[theme.charts.emptyPattern]}
                fill={[
                    {
                        match: {
                            id: applyEmptyPatternTo,
                        },
                        id: 'empty',
                    },
                ]}
            />
        </div>
    )
}

export default StreamChart
