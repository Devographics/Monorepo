import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveLine } from '@nivo/line'
import { HappinessYearMean } from '@types/survey_api/happiness'

const horizontalAxis = {
    tickSize: 10,
    tickPadding: 6
}

const verticalAxis = {
    tickValues: [1, 5],
    tickPadding: 16,
    renderTick: (d: { value: number; x: number; y: number; textX: number; textAnchor: string }) => {
        let text = ''
        if (d.value === 1) text = '☹️'
        if (d.value === 5) text = '🙂'

        return (
            <text
                style={{ fontSize: 24 }}
                x={d.x + d.textX}
                y={d.y}
                textAnchor={d.textAnchor}
                alignmentBaseline="middle"
            >
                {text}
            </text>
        )
    }
}

const MARGIN = {
    top: 40,
    right: 60,
    bottom: 40,
    left: 60
}
const Y_SCALE = {
    type: 'linear',
    min: 1,
    max: 5
}
const GRID_Y_VALUES = [1, 3, 5]

interface HappinessHistoryChartProps {
    data: HappinessYearMean[]
}

export const HappinessHistoryChart = ({ data }: HappinessHistoryChartProps) => {
    const theme = useTheme()

    const normalizedData = useMemo(() => {
        return [
            {
                id: 'happiness',
                data: data.map(year => ({
                    x: year.year,
                    y: year.mean
                }))
            }
        ]
    }, [data])

    const customizedTheme = useMemo(
        () => ({
            ...theme.charts,
            axis: theme.charts.streamTimelineAxis,
            dots: {
                text: {
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 600,
                    fontSize: 12,
                    fill: theme.colors.text
                }
            }
        }),
        [theme]
    )

    return (
        <div style={{ height: 240 }}>
            <ResponsiveLine
                theme={customizedTheme}
                colors={[theme.colors.lineChartDefaultColor]}
                lineWidth={4}
                margin={MARGIN}
                yScale={Y_SCALE as any}
                data={normalizedData}
                gridYValues={GRID_Y_VALUES}
                axisTop={horizontalAxis}
                axisRight={verticalAxis as any}
                axisBottom={horizontalAxis}
                axisLeft={verticalAxis as any}
                enablePoints
                enablePointLabel
                pointLabelYOffset={4}
                pointSize={42}
                pointColor={theme.colors.background}
                pointBorderColor={theme.colors.lineChartDefaultColor}
                pointBorderWidth={4}
                isInteractive={false}
                animate={false}
            />
        </div>
    )
}
