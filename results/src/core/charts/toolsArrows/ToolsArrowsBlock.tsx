import React from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { BlockContext } from 'core/blocks/types'
import { ToolsArrowsChart } from './ToolsArrowsChart'
import {
    AllToolsData,
    Bucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper } from '../common2'
import ChartShare from '../common2/ChartShare'

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
        // console.log('////')
        // console.log(tool)
        return {
            ...tool,
            responses: {
                ...tool.responses,
                allEditions: tool.responses.allEditions.map(edition => {
                    // console.log(edition)
                    const findFacetBucket = (id: string, id1: string, id2: string) => {
                        const bucket = edition.buckets.find(b => b.id === id1)

                        // console.log(id, id1, id2)
                        // console.log(bucket)
                        const facetBucket = bucket?.facetBuckets?.find(fb => fb.id === id2)
                        return {
                            id,
                            percentageQuestion: facetBucket?.percentageQuestion,
                            count: facetBucket?.count
                        }
                    }
                    const oldFormatBuckets = [
                        findFacetBucket(
                            'never_heard',
                            FeaturesOptions.NEVER_HEARD,
                            SimplifiedSentimentOptions.NEUTRAL_SENTIMENT
                        ),
                        findFacetBucket(
                            'interested',
                            FeaturesOptions.HEARD,
                            SimplifiedSentimentOptions.POSITIVE_SENTIMENT
                        ),
                        findFacetBucket(
                            'not_interested',
                            FeaturesOptions.HEARD,
                            SimplifiedSentimentOptions.NEGATIVE_SENTIMENT
                        ),
                        findFacetBucket(
                            'would_use',
                            FeaturesOptions.USED,
                            SimplifiedSentimentOptions.POSITIVE_SENTIMENT
                        ),
                        findFacetBucket(
                            'would_not_use',
                            FeaturesOptions.USED,
                            SimplifiedSentimentOptions.NEGATIVE_SENTIMENT
                        )
                    ]
                    return { ...edition, buckets: oldFormatBuckets as Bucket[] }
                })
            }
        }
    })
}
export const ToolsArrowsBlock = ({ block, series, triggerId = null }: ToolsArrowsBlockProps) => {
    const controlledCurrent = triggerId
    const { data } = series[0]
    return (
        <ChartWrapper>
            <>
                <ToolsArrowsChart
                    data={convertData(data)}
                    current={controlledCurrent}
                    activeCategory="all"
                />
                <ChartFooter
                    right={
                        <>
                            <ChartShare block={block} />
                            {/* <ChartData {...commonProps} /> */}
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default ToolsArrowsBlock
