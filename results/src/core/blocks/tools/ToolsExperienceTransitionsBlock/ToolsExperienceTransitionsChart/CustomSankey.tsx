import React, { useMemo, useState } from 'react'
import { ToolExperienceId } from 'core/bucket_keys'
import { SankeyNodeDatum, SankeyLinkDatum } from '../types'
import { LinkPercentages } from './LinkPercentages'
import { Nodes } from './Nodes'

let _uid = 0

/**
 * Used to entirely replace the default nivo Sankey component,
 * the default component is only used to compute node positions
 * and links.
 *
 * This should be passed as the only layer to the Sankey component.
 */
export const CustomSankey = ({ nodes, links }: {
    nodes: SankeyNodeDatum[]
    links: SankeyLinkDatum[]
}) => {
    console.log({
        nodes,
        links,
    })
    const [currentExperience, setCurrentExperience] = useState<ToolExperienceId>('interested')

    const uid = useMemo(() => {
        const newUid = _uid
        _uid += 1

        return newUid
    }, [])

    return (
        <>
            <Nodes
                nodes={nodes}
                currentExperience={currentExperience}
                setCurrentExperience={setCurrentExperience}
            />
            <LinkPercentages links={links} />
        </>
    )
}