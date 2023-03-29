import React from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useTheme } from 'styled-components'
import { ResponsiveBump } from '@nivo/bump'
import { BasicTooltip } from '@nivo/tooltip'
import { ResponsiveLine } from '@nivo/line'
import { RatiosUnits, BucketUnits, ToolRatiosQuestionData } from '@devographics/types'
import { getLabel } from 'core/blocks/tools/ToolsExperienceLineChartBlock'
import { Entity } from '@devographics/types'
import { useEntities } from 'core/helpers/entities'

export const getChartData = (
    data: ToolRatiosQuestionData,
    options: { allEntities: Entity[]; units: RatiosUnits }
) => {
    const { units, allEntities } = options
    const buckets = data.items.map(tool => {
        return {
            id: tool.id,
            name: getLabel(tool.id, allEntities),
            data: tool[units]?.map((bucket, index) => {
                const datapoint = {
                    x: bucket.year,
                    y: bucket.percentageQuestion,
                    percentageQuestion: bucket.percentageQuestion
                }
                // add all metrics to datapoint for ease of debugging
                Object.values(RatiosUnits).forEach(metric => {
                    datapoint[`${metric}_percentage`] = tool[metric][index].percentageQuestion
                })
                return datapoint
            })
        }
    })
    return buckets
}

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

// interface CustomPointProps {
// }

interface Point {
    x: number
    y: number
    isInactive: boolean
    size: number
    borderColor: string
    borderWidth: number
    data: RankingChartDatum
}

const CustomPoint = props => {
    // console.log(props)

    const { datum, size, color, borderColor, borderWidth } = props
    const { x, y, percentageQuestion } = datum
    const theme = useTheme()

    const transition = useSpring({
        transform: `translate(${x}, ${y})`,
        radius: size / 2,
        shadowRadius: (size + borderWidth) / 2
    })

    const isInactive = false

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
                    {Math.round(percentageQuestion)}%
                </text>
            )}
        </animated.g>
    )
}

interface CustomTooltipProps {
    name: string
    color: string
}

const CustomTooltip = (props: CustomTooltipProps) => {
    const { point, getName } = props
    const { id, color, borderColor, data, serieColor, serieId, x, y, index } = point
    const { x: year, percentageQuestion } = data
    return (
        <BasicTooltip
            id={`${getName(serieId)}: ${percentageQuestion}% (${year})`}
            enableChip={true}
            color={serieColor}
        />
    )
}

interface RankingChartProps {
    data: ToolRatiosQuestionData
}

/*

Note: when displaying mulitple series via DynamicDataLoader
we need to call processBlockData() again whenever the metric changes, 
which will not happen unless we call it from within the chart

*/
export const LineChart = ({ units, data: unprocessedData }: RankingChartProps) => {
    const allEntities = useEntities()
    const buckets = getChartData(unprocessedData, { allEntities, units })

    const theme = useTheme()
    // const { getString } = useI18n()

    const getName = (entityId: string) => buckets?.find(series => series.id === entityId)?.name

    // console.log(theme)
    return (
        <ResponsiveLine
            data={buckets}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            colors={theme.colors.distinct}
            theme={theme.charts}
            lineWidth={2}
            // xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 0,
                max: 100
                // stacked: true,
                // reverse: false
            }}
            yFormat=" >-.2f"
            enableGridX={true}
            enableGridY={true}
            gridYValues={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            axisTop={{
                tickSize: 0,
                tickPadding: 9
            }}
            axisRight={{
                tickSize: 0,
                tickPadding: 9
            }}
            axisBottom={{
                tickSize: 0,
                tickPadding: 9
            }}
            axisLeft={{
                tickSize: 0,
                tickPadding: 9
            }}
            // pointComponent={CustomPoint}
            enablePoints={true}
            pointSize={10}
            pointColor={theme.colors.background}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            // pointSymbol={CustomPoint}

            // startLabel={d => d.name}
            // startLabelTextColor={{
            //     from: 'color',
            //     modifiers: [['brighter', 1]]
            // }}
            // startLabelPadding={20}
            // endLabel={d => d.name}
            // endLabelTextColor={{
            //     from: 'color',
            //     modifiers: [['brighter', 1]]
            // }}
            // endLabelPadding={20}

            tooltip={props => <CustomTooltip {...props} getName={getName} />}
            // pointSize={10}
            // pointColor={{ theme: 'background' }}
            // pointBorderWidth={2}
            // pointBorderColor={{ from: 'serieColor' }}
            // pointLabelYOffset={-12}
            // debugMesh={true}
            useMesh={true}
            isInteractive={true}
            enableCrosshair={false}
            // legends={[
            //     {
            //         anchor: 'bottom-left',
            //         direction: 'row',
            //         justify: false,
            //         translateX: 0,
            //         translateY: 0,
            //         itemsSpacing: 0,
            //         itemDirection: 'left-to-right',
            //         itemWidth: 80,
            //         itemHeight: 20,
            //         itemOpacity: 0.75,
            //         symbolSize: 12,
            //         symbolShape: 'circle',
            //         symbolBorderColor: 'rgba(0, 0, 0, .5)',
            //         effects: [
            //             {
            //                 on: 'hover',
            //                 style: {
            //                     itemBackground: 'rgba(0, 0, 0, .03)',
            //                     itemOpacity: 1
            //                 }
            //             }
            //         ]
            //     }
            // ]}
        />
    )
}
