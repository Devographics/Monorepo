import React, { useState } from 'react'
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
import MultiItemsCategories from '../multiItemsExperience/MultiItemsCategories'

interface ToolsArrowsBlockProps {
    index: number
    block: BlockVariantDefinition
    series: DataSeries<StandardQuestionData[]>[]
    triggerId: string | null
}

// convert data from new 3-option format back to old 5-option format
const convertData = (data: StandardQuestionData[], sectionId: string) => {
    let allTools = data.map(tool => {
        return {
            ...tool,
            responses: {
                ...tool.responses,
                allEditions: tool.responses.allEditions.map(edition => {
                    const findFacetBucket = (id: string, id1: string, id2: string) => {
                        const bucket = edition.buckets.find(b => b.id === id1)
                        const facetBucket = bucket?.facetBuckets?.find(fb => fb.id === id2)

                        let percentageQuestion = facetBucket?.percentageQuestion || 0
                        const neutralFacetBucket = bucket?.facetBuckets?.find(
                            fb => fb.id === SimplifiedSentimentOptions.NEUTRAL_SENTIMENT
                        )
                        if (
                            [FeaturesOptions.HEARD, FeaturesOptions.USED].includes(
                                id1 as FeaturesOptions
                            ) &&
                            neutralFacetBucket
                        ) {
                            // for heard/used, if neutral bucket exists, account for it

                            // percentage of respondents who picked "heard" or "used"
                            // and also picked a sentiment
                            const withSentimentPercentage =
                                100 - (neutralFacetBucket?.percentageQuestion || 0)

                            // multiply percentageQuestion by withSentimentPercentage
                            percentageQuestion =
                                (percentageQuestion * 100) / withSentimentPercentage
                        }

                        return {
                            id,
                            percentageQuestion,
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
    if (sectionId) {
        allTools = allTools.filter(tool => tool._metadata.sectionId === sectionId)
    }
    return allTools
}
export const ToolsArrowsBlock = ({
    block,
    question,
    series,
    triggerId = null
}: ToolsArrowsBlockProps) => {
    const controlledCurrent = triggerId
    const { data } = series[0]
    const [filter, setFilter] = useState<string | undefined>()
    const chartState = {
        filter,
        setFilter
    }
    return (
        <ChartWrapper question={question}>
            <>
                <ChartContainer>
                    <>
                        <div className="tools-arrows-view-switcher">
                            <MultiItemsCategories block={block} chartState={chartState} />
                        </div>
                        <ToolsArrowsChart
                            data={convertData(data, filter)}
                            current={controlledCurrent}
                            activeCategory="all"
                        />
                    </>
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
