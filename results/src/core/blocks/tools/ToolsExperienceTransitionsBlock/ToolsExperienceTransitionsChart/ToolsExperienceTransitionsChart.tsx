import React from 'react'
import {Sankey} from "@nivo/sankey";
import { ApiToolExperienceTransitions } from '../types'
import { staticProps } from './config'

export const ToolsExperienceTransitionsChart = ({
    data
}: {
    data: ApiToolExperienceTransitions
}) => {
    const chartData = {
        nodes: data.experienceTransitions.nodes,
        links: data.experienceTransitions.transitions.map(transition => {
            return {
                source: transition.from,
                target: transition.to,
                value: transition.count,
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
                nodeThickness={18}
                nodeInnerPadding={1}
                nodeSpacing={2}
                nodeOpacity={1}
                linkContract={1}
                linkOpacity={1}
                animate={false}
            />
        </div>
    )
}