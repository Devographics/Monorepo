// @ts-ignore
import React from 'react'
// @ts-ignore
import { useSpring, animated } from '@react-spring/web'
import { useTheme } from 'styled-components'
import { ResponsiveBump } from '@nivo/bump'
import { BasicTooltip } from '@nivo/tooltip'

export interface RankingChartDatum {
    // year
    x: number
    // rank
    y: number
    // percentage attached to a specific year
    // used to compute the rank
    percentageQuestion: number
}

export interface RankingChartSerie {
    id: string
    name: string
    data: RankingChartDatum[]
}

interface CustomPointProps {
    point: Point
}

interface Point {
    x: number
    y: number
    isInactive: boolean
    size: number
    borderColor: string
    borderWidth: number
    data: RankingChartDatum
}

const CustomPoint = (props: CustomPointProps) => {
    const { x, y, data, isInactive, size, borderColor, borderWidth } = props.point
    const theme = useTheme()

    const transition = useSpring({
        transform: `translate(${x}, ${y})`,
        radius: size / 2,
        shadowRadius: (size + borderWidth) / 2
    })

    return (
        <animated.g transform={transition.transform} style={{ pointerEvents: 'none' }}>
            <animated.circle r={transition.shadowRadius} cy={size / 5} fill="rgba(0, 0, 0, .2)" />
            <animated.circle
                r={transition.radius}
                fill={theme.colors.background}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />
            {!isInactive && (
                <text textAnchor="middle" y={4} fill={theme.colors.text} fontSize="11px">
                    {Math.round(data?.percentageQuestion)}%
                </text>
            )}
        </animated.g>
    )
}

interface CustomTooltipProps {
    name: string
    color: string
    getName: func
}

const CustomTooltip = ({ id, color, getName }: CustomTooltipProps) => (
    <BasicTooltip id={getName(id)} enableChip={true} color={color} />
)

interface RankingChartProps {
    buckets: RankingChartSerie[]
    processBlockData: Function
    processBlockDataOptions: any
}

export const RankingChart = ({
    buckets: unprocessedData,
    processBlockData,
    processBlockDataOptions
}: RankingChartProps) => {
    const buckets = processBlockData(unprocessedData, processBlockDataOptions)

    const theme = useTheme()

    const getName = (entityId: string) => buckets?.find(series => series.id === entityId)?.name

    return (
        <ResponsiveBump
            data={buckets}
            margin={{ top: 40, right: 150, bottom: 40, left: 150 }}
            colors={theme.colors.distinct}
            // @ts-ignore
            inactiveLineWidth={5}
            theme={theme.charts}
            enableGridX={true}
            enableGridY={false}
            axisTop={{
                tickSize: 0,
                tickPadding: 9
            }}
            axisRight={null}
            axisBottom={{
                tickSize: 0,
                tickPadding: 9
            }}
            axisLeft={null}
            startLabel={d => d.name}
            startLabelTextColor={{
                from: 'color',
                modifiers: [['brighter', 1]]
            }}
            startLabelPadding={20}
            endLabel={d => d.name}
            endLabelTextColor={{
                from: 'color',
                modifiers: [['brighter', 1]]
            }}
            endLabelPadding={20}
            pointComponent={CustomPoint}
            lineWidth={5}
            pointSize={36}
            pointBorderWidth={3}
            pointBorderColor={{ from: 'serie.color' }}
            activeLineWidth={8}
            activePointSize={42}
            activePointBorderWidth={4}
            inactivePointSize={0}
            inactivePointBorderWidth={2}
            // @ts-ignore
            tooltip={({ serie }) => <CustomTooltip {...serie} getName={getName} />}
        />
    )
}
