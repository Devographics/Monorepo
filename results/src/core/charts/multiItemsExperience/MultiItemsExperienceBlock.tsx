import React, { useState } from 'react'
import './MultiItemsExperience.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'
import compact from 'lodash/compact'
import { MultiItemsExperienceControls } from './MultiItemsExperienceControls'
import {
    ChartState,
    CombinedBucket,
    CombinedItem,
    DEFAULT_VARIABLE,
    GroupingOptions,
    MultiItemsExperienceBlockProps,
    OrderOptions,
    Totals,
    experienceColors,
    sentimentColors,
    sortOptions
} from './types'
import {
    combineBuckets,
    getBuckets,
    getGroupedTotals,
    sortByExperience,
    sortBySentiment
} from './helpers'

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    console.log(props)
    const { data } = props
    const { items } = data
    const [grouping, setGrouping] = useState<ChartState['grouping']>(GroupingOptions.EXPERIENCE)
    const [sort, setSort] = useState<ChartState['sort']>(FeaturesOptions.USED)
    const [order, setOrder] = useState<ChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<ChartState['variable']>(DEFAULT_VARIABLE)

    const chartState = {
        grouping,
        setGrouping,
        sort,
        setSort,
        order,
        setOrder,
        variable,
        setVariable
    }

    const className = `multiexp multiexp-groupedBy-${grouping}`

    let sortedItems = sortBy(items, item => {
        const buckets = item.responses.currentEdition.buckets
        if (grouping === GroupingOptions.EXPERIENCE) {
            const sortingBucket = buckets.find(bucket => bucket.id === sort)
            return sortingBucket?.percentageQuestion
        } else {
            const activeSentimentBuckets = compact(
                buckets.map(bucket => bucket.facetBuckets.find(fb => fb.id === sort)).flat()
            )
            const sentimentTotalPercentage = sumBy(
                activeSentimentBuckets,
                fb => fb.percentageQuestion || 0
            )
            return sentimentTotalPercentage
        }
    })

    if (order === OrderOptions.DESC) {
        sortedItems = sortedItems.toReversed()
    }
    const columnIds = sortOptions[grouping]

    const groupedTotals = sortedItems.map(item =>
        getGroupedTotals({ item, bucketIds: columnIds, variable, grouping })
    )

    console.log(sortedItems)
    console.log(groupedTotals)

    const combinedItems: CombinedItem[] = sortedItems.map(item => ({
        id: item.id,
        entity: item.entity,
        combinedBuckets: combineBuckets(getBuckets(item))
    }))

    return (
        <div className={className}>
            <MultiItemsExperienceControls chartState={chartState} />
            <div className="multiexp-rows">
                {combinedItems.map(item => (
                    <Row
                        key={item.id}
                        item={item}
                        groupedTotals={groupedTotals}
                        chartState={chartState}
                    />
                ))}
            </div>
        </div>
    )
}

const Row = ({
    item,
    groupedTotals,
    chartState
}: {
    item: CombinedItem
    groupedTotals: Totals[]
    chartState: ChartState
}) => {
    const { grouping } = chartState
    const { combinedBuckets } = item
    let sortedBuckets: CombinedBucket[]
    if (grouping === GroupingOptions.EXPERIENCE) {
        sortedBuckets = sortByExperience(sortBySentiment(combinedBuckets))
    } else {
        sortedBuckets = sortBySentiment(sortByExperience(combinedBuckets))
    }

    return (
        <div className="multiexp-row">
            <h3 className="multiexp-row-heading">{item.id}</h3>
            <div className="multiexp-items">
                {sortedBuckets.map(combinedBucket => (
                    <Item
                        key={combinedBucket.id}
                        combinedBucket={combinedBucket}
                        chartState={chartState}
                    />
                ))}
            </div>
        </div>
    )
}

const Item = ({
    combinedBucket,
    chartState
}: {
    combinedBucket: CombinedBucket
    chartState: ChartState
}) => {
    const { variable } = chartState
    const { bucket, facetBucket } = combinedBucket
    const value = facetBucket[variable]
    const style = {
        '--percentageValue': value,
        '--experienceColor': experienceColors[bucket.id as FeaturesOptions],
        '--sentimentColor': sentimentColors[facetBucket.id as SimplifiedSentimentOptions]
    }
    return (
        <div className="multiexp-item" style={style}>
            <div className="multiexp-item-box">
                <div className="multiexp-item-segment multiexp-item-segment-experience"></div>
                <div className="multiexp-item-segment multiexp-item-segment-sentiment"></div>
            </div>
            {/* <div>{combinedBucket.id}</div> */}
            <div>{value}%</div>
        </div>
    )
}

export default MultiItemsExperienceBlock
