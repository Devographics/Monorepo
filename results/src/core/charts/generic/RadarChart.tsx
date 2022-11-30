// @ts-ignore
import React from 'react'
// @ts-ignore
import { useSpring, animated } from '@react-spring/web'
import { useTheme } from 'styled-components'
import { ResponsiveBump } from '@nivo/bump'
import { BasicTooltip } from '@nivo/tooltip'

// import { ResponsiveRadar } from '@nivo/radar'

export interface RadarChartDatum {
    // year
    x: number
    // rank
    y: number
    // percentage attached to a specific year
    // used to compute the rank
    percentage_question: number
}

export interface RadarChartSerie {
    id: string
    name: string
    data: RadarChartDatum[]
}

const CustomTooltip = ({ name, color }: CustomTooltipProps) => (
    <BasicTooltip id={name} enableChip={true} color={color} />
)

export const RadarChart = ({ data, keys }: RankingChartProps) => {
    const theme = useTheme()


    const getLayerColor = (props: any) => {
        console.log(props)
    }

    return (
    <ResponsiveRadar
        data={data}
        keys={keys}
        indexBy="id"
        valueFormat=">-.2f"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderColor={{ from: 'color' }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'category10' }}
        fillOpacity={0.5}
        blendMode="screen"
        motionConfig="wobbly"
        legends={[
            {
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
    )
}
