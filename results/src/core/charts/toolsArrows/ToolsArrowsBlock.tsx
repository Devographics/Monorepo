import React from 'react'
import ChartContainer from 'core/charts/ChartContainer'
import { ToolsArrowsChart } from './ToolsArrowsChart'
import {
    Bucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { ChartFooter, ChartWrapper, Note } from '../common2'
import ChartShare from '../common2/ChartShare'
import { BlockVariantDefinition } from 'core/types'

interface ToolsArrowsBlockProps {
    index: number
    block: BlockVariantDefinition
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
export const ToolsArrowsBlock = ({
    block,
    question,
    series,
    triggerId = null
}: ToolsArrowsBlockProps) => {
    const controlledCurrent = triggerId
    const { data } = series[0]

    return (
        <ChartWrapper question={question}>
            <>
                <ChartContainer>
                    <ToolsArrowsChart
                        data={convertData(data)}
                        current={controlledCurrent}
                        activeCategory="all"
                    />
                </ChartContainer>
                <Note block={block} />

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
