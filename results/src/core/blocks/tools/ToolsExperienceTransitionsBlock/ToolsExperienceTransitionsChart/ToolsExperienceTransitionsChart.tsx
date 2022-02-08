import React from 'react'
import { useTheme } from 'styled-components'
import {Sankey} from "@nivo/sankey";
import { ApiToolExperienceTransitions } from '../types'
import { staticProps } from './config'

export const ToolsExperienceTransitionsChart = ({
    data
}: {
    data: ApiToolExperienceTransitions
}) => {
    const theme = useTheme()

    const chartData = {
        nodes: data.experienceTransitions.nodes,
        links: data.experienceTransitions.transitions.map(transition => {
            return {
                source: transition.from,
                target: transition.to,
                value: transition.count,
                percentage: transition.percentage,
            }
        }),
    }

    return (
        <div>
            <Sankey
                width={600}
                height={160}
                margin={staticProps.margin}
                data={chartData}
                sort="input"
                align="justify"
                colors={(node) => {
                    return theme.colors.ranges.tools[node.choice][0]
                }}
                nodeThickness={18}
                nodeInnerPadding={1}
                nodeSpacing={2}
                nodeOpacity={1}
                linkContract={1}
                linkOpacity={1}
                animate={false}
                // @ts-ignore
                layers={staticProps.layers}
            />
        </div>
    )
}