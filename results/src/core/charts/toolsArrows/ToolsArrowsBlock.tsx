import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { BlockContext } from 'core/blocks/types'
import { ToolsArrowsChart } from './ToolsArrowsChart'
import { AllToolsData } from '@devographics/types'

interface ToolsArrowsBlockProps {
    index: number
    block: BlockContext<
        'toolsExperienceMarimekkoTemplate',
        'ToolsExperienceMarimekkoBlock',
        { toolIds: string },
        any
    >
    data: AllToolsData
    triggerId: string | null
}

export const ToolsArrowsBlock = ({ block, data, triggerId = null }: ToolsArrowsBlockProps) => {
    const controlledCurrent = triggerId

    return (
        <Block block={block} data={data}>
            <ChartContainer vscroll={false}>
                <ToolsArrowsChart
                    data={data.items}
                    current={controlledCurrent}
                    activeCategory="all"
                />
            </ChartContainer>
        </Block>
    )
}

export default ToolsArrowsBlock
