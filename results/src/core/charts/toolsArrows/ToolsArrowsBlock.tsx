import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { BlockContext } from 'core/blocks/types'
import { ToolsArrowsChart } from './ToolsArrowsChart'
import { AllToolsData, Bucket, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'

interface ToolsArrowsBlockProps {
    index: number
    block: BlockContext<
        'toolsExperienceMarimekkoTemplate',
        'ToolsExperienceMarimekkoBlock',
        { toolIds: string },
        any
    >
    series: DataSeries<StandardQuestionData[]>[]
    triggerId: string | null
}

// convert data from new 3-option format back to old 5-option format
const convertData = (data: StandardQuestionData[]) => {
    return data.map(tool => {
        const oldFormatBuckets = [
            { id: 'never_heard', percentageQuestion: 22 },
            { id: 'not_interested', percentageQuestion: 22 },
            { id: 'interested', percentageQuestion: 22 },
            { id: 'would_not_use', percentageQuestion: 22 },
            { id: 'would_use', percentageQuestion: 22 }
        ]
        tool.responses.allEditions = tool.responses.allEditions.map(edition => {
            edition.buckets = oldFormatBuckets as Bucket[]
            return edition
        })
        return tool
    })
}
export const ToolsArrowsBlock = ({ block, series, triggerId = null }: ToolsArrowsBlockProps) => {
    const controlledCurrent = triggerId
    const { data } = series[0]
    return (
        <Block block={block} data={data}>
            <ChartContainer vscroll={false}>
                <ToolsArrowsChart
                    data={convertData(data)}
                    current={controlledCurrent}
                    activeCategory="all"
                />
            </ChartContainer>
        </Block>
    )
}

export default ToolsArrowsBlock
