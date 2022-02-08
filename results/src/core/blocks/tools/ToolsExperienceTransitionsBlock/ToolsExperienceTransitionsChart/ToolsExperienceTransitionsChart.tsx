import React, { useCallback, useMemo } from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveSankey } from '@nivo/sankey'
import { ToolExperienceId } from 'core/bucket_keys'
import { ApiToolExperienceTransitions } from '../types'
import { staticProps } from './config'
import { ChartContainer, ToolLegendContainer, ToolLegend } from './ChartContainer'
import { ChartContextProvider } from './state'

export const ToolsExperienceTransitionsChart = ({
    data,
    currentExperience,
    setCurrentExperience,
    currentTransition,
    setCurrentTransition,
}: {
    data: ApiToolExperienceTransitions
    currentExperience: ToolExperienceId
    setCurrentExperience: (experience: ToolExperienceId) => void
    currentTransition: [ToolExperienceId, ToolExperienceId] | null
    setCurrentTransition: (transition: [ToolExperienceId, ToolExperienceId] | null) => void
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

    const context = useMemo(() => ({
        toolId: data.id,
        currentExperience,
        setCurrentExperience,
        currentTransition,
        setCurrentTransition,
    }), [
        data.id,
        currentExperience,
        setCurrentExperience,
        currentTransition,
        setCurrentTransition,
    ])

    const getColor = useCallback(({ choice }: { choice: ToolExperienceId }) => {
        return theme.colors.ranges.tools[choice][0]
    }, [theme])

    return (
        <ChartContextProvider value={context}>
            <ChartContainer>
                <ToolLegendContainer>
                    <ToolLegend>
                        {data.entity.name}
                    </ToolLegend>
                </ToolLegendContainer>
                <ResponsiveSankey
                    margin={staticProps.margin}
                    data={chartData}
                    sort="input"
                    align="justify"
                    colors={getColor}
                    nodeThickness={18}
                    nodeInnerPadding={1}
                    nodeSpacing={2}
                    linkContract={1}
                    animate={false}
                    // @ts-ignore
                    layers={staticProps.layers}
                />
            </ChartContainer>
        </ChartContextProvider>
    )
}