import React, { useMemo } from 'react'
import { useTransition, animated } from '@react-spring/web'
import { useTheme } from 'styled-components'
import { useMotionConfig } from '@nivo/core'
import { ResponsiveMarimekko } from '@nivo/marimekko'
import ChartLabel from 'core/components/ChartLabel'
import { isPercentage } from 'core/helpers/units'
import { BlockLegend, BlockUnits } from 'core/types/index'
import { FeatureQuestionData, ToolQuestionData } from '@devographics/types'
import keyBy from 'lodash/keyBy'

interface ExperienceByYearBarChartProps {
    data: FeatureQuestionData | ToolQuestionData
    legends: BlockLegend[]
    units: BlockUnits
    spacing: number
}

const YearLabelsLayer = ({
    data
}: {
    data: {
        id: string | number
        y: number
        height: number
    }[]
}) => {
    const theme = useTheme()

    return (
        <>
            {data.map(datum => (
                <text
                    key={`${datum.id}`}
                    x={-16}
                    textAnchor="end"
                    y={datum.y + datum.height / 2}
                    dy={5}
                    fill={theme.colors.text}
                    style={{
                        fontWeight: 800
                    }}
                >
                    {datum.id}
                </text>
            ))}
        </>
    )
}

const ValuesLayer = ({
    bars
}: {
    bars: {
        key: string
        x: number
        y: number
        width: number
        height: number
        formattedValue: string | number
    }[]
}) => {
    const filteredBars = useMemo(() => bars.filter(bar => bar.width >= 32), [bars])

    const { animate, config: springConfig } = useMotionConfig()
    const transition = useTransition(filteredBars, {
        key: bar => bar.key,
        initial: bar => ({
            opacity: 1,
            transform: `translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`
        }),
        from: bar => ({
            opacity: 0,
            transform: `translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`
        }),
        enter: bar => ({
            opacity: 1,
            transform: `translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`
        }),
        update: bar => ({
            opacity: 1,
            transform: `translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`
        }),
        leave: bar => ({
            opacity: 0,
            transform: `translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`
        }),
        immediate: !animate,
        config: springConfig
    })

    return (
        <>
            {transition((style, bar) => (
                <animated.g key={bar.key} transform={style.transform} opacity={style.opacity}>
                    <ChartLabel label={bar.formattedValue} style={{ pointerEvents: 'none' }} />
                </animated.g>
            ))}
        </>
    )
}

// export const getChartData = (data: FeatureQuestionData | ToolQuestionData) =>
//     data.responses.allEditions

const getChartData = ({
    data,
    legends
}: {
    data: FeatureQuestionData | ToolQuestionData
    legends: BlockLegend[]
}) => {
    const allEditions = data.responses.allEditions
    return allEditions.map((editionData, index) => {
        const yearData = legends.map((key: { id: string }) => {
            const matchingBucket = editionData.buckets.find(bucket => bucket.id === key.id)
            return (
                matchingBucket || {
                    id: key.id,
                    count: 0,
                    percentage: 0
                }
            )
        })

        const isLastYear = index === allEditions.length - 1

        return {
            year: editionData.year,
            ...keyBy(yearData, 'id'),
            thickness: isLastYear ? 2 : 1
        }
    })
}
export const ExperienceByYearBarChart = (props: ExperienceByYearBarChartProps) => {
    const theme = useTheme()
    const { data, legends, units, spacing } = props
    const buckets = getChartData({ data, legends })
    const dimensions = legends.map(key => ({
        id: key.label,
        value: `${key.id}.${units}`
    }))
    const colors = legends.map(key => key.color)

    const valueFormat = isPercentage(units)
        ? (value: number) => `${Math.round(value * 100) / 100}%`
        : (value: number) => value

    return (
        <ResponsiveMarimekko
            innerPadding={spacing}
            data={buckets}
            id="year"
            value="thickness"
            valueFormat={valueFormat as any}
            dimensions={dimensions}
            margin={{ left: 60 }}
            layout="horizontal"
            colors={colors}
            theme={theme.charts}
            enableGridY={false}
            enableGridX={false}
            animate={true}
            layers={[YearLabelsLayer, 'bars', ValuesLayer]}
        />
    )
}
