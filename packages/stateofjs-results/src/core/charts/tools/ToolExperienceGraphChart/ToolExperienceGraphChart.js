import React from 'react'
import { ResponsiveSankey } from '@nivo/sankey'
import { useTheme } from 'styled-components'
import { keys } from 'core/bucket_keys'
import YearsLayer from './YearsLayer'
import NodeTooltip from './NodeTooltip'
import LinkTooltip from './LinkTooltip'

const sortedExperienceKeys = [
    'never_heard',
    'not_interested',
    'interested',
    'would_not_use',
    'would_use',
]

const getColor = (d) => {
    // it's a node
    if (d.id) {
        return keys.tools.keys.find((xp) => xp.id === d.experience).color
    }

    // otherwise it's a link
    // the returned color for links does not matter as link gradients
    // are enabled and will use source/target node colors
    return '#000000'
}

const minNodeValueOnTop = (nodeA, nodeB) => {
    return (
        sortedExperienceKeys.findIndex((xp) => xp === nodeA.experience) -
        sortedExperienceKeys.findIndex((xp) => xp === nodeB.experience)
    )
}

const ToolExperienceGraphChart = ({ data }) => {
    const theme = useTheme()

    const links = data.links.map((link) => ({
        ...link,
        value: link.count,
    }))

    return (
        <ResponsiveSankey
            layers={[YearsLayer, 'links', 'nodes', 'labels', 'legends']}
            margin={{ top: 60, right: 16, bottom: 40, left: 16 }}
            data={{
                nodes: data.nodes,
                links,
            }}
            sort={minNodeValueOnTop}
            align="center"
            theme={theme.charts}
            colors={getColor}
            animate={false}
            enableLabels={false}
            nodeThickness={20}
            nodeSpacing={12}
            nodeOpacity={1}
            nodeBorderWidth={0}
            nodeInnerPadding={2}
            nodeTooltip={(node) => <NodeTooltip {...node} />}
            linkContract={1}
            linkBlendMode="screen"
            enableLinkGradient
            linkOpacity={0.75}
            linkHoverOpacity={1}
            linkTooltip={(link) => <LinkTooltip {...link} />}
        />
    )
}

export default ToolExperienceGraphChart
