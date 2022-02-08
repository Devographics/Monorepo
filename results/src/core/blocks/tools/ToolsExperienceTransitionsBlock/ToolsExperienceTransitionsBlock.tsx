import React, { useMemo, useState } from 'react'
import { ToolExperienceId } from 'core/bucket_keys'
import Block from 'core/blocks/block/BlockVariant'
import {
    ToolsExperienceTransitionsBlockData,
    ApiToolExperienceTransitions,
} from './types'
import { Grid } from './Grid'
import { ToolsExperienceTransitionsChart } from './ToolsExperienceTransitionsChart'
import { useLegends } from 'core/helpers/useBucketKeys'

export const ToolsExperienceTransitionsBlock = ({
    block,
    data,
}: {
    block: ToolsExperienceTransitionsBlockData
    data: ApiToolExperienceTransitions[]
}) => {
    const filteredData = useMemo(() =>
        data.filter(toolData => toolData.experienceTransitions.nodes.length > 0),
        [data]
    )

    const [currentExperience, setCurrentExperience] = useState<ToolExperienceId>('interested')
    const [currentTransition, setCurrentTransition] = useState<[ToolExperienceId, ToolExperienceId] | null>(null)

    const keys = data[0].experienceTransitions.keys
    const legends = useLegends(block, keys, 'tools')
    const legendProps = useMemo(() => ({
        current: currentExperience,
        onClick: ({ id }: { id: ToolExperienceId }) => {
            setCurrentExperience(id)
        }
    }), [currentExperience, setCurrentExperience])

    return (
        <Block
            block={block}
            data={filteredData}
            legends={legends}
            legendProps={legendProps}
        >
            <Grid>
                {filteredData.map(toolData => (
                    <ToolsExperienceTransitionsChart
                        key={toolData.id}
                        data={toolData}
                        currentExperience={currentExperience}
                        setCurrentExperience={setCurrentExperience}
                        currentTransition={currentTransition}
                        setCurrentTransition={setCurrentTransition}
                    />
                ))}
            </Grid>
        </Block>
    )
}