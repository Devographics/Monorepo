import React from 'react'
import {
    ChartState,
    ColumnId,
    CombinedBucket,
    CombinedItem,
    GroupingOptions,
    MaxValue,
    Totals,
    sortOptions
} from './types'
import { sortByExperience, sortBySentiment } from './helpers'
import { Item } from './MultiItemsExperienceItem'
import sum from 'lodash/sum'
import take from 'lodash/take'

type BucketDimension = { id: CombinedBucket['id']; width: number; offset: number }

const ITEM_GAP_PERCENT = 1
const COLUMN_GAP_PERCENT = 5

export const Row = ({
    item,
    groupedTotals,
    maxValues,
    chartState,
    order
}: {
    item: CombinedItem
    groupedTotals: Totals[]
    maxValues: MaxValue[]
    chartState: ChartState
    order: number
}) => {
    const { grouping, variable } = chartState
    const { combinedBuckets } = item
    let sortedBuckets: CombinedBucket[]
    if (grouping === GroupingOptions.EXPERIENCE) {
        sortedBuckets = sortByExperience(sortBySentiment(combinedBuckets))
    } else {
        sortedBuckets = sortBySentiment(sortByExperience(combinedBuckets))
    }

    const getWidth = (combinedBucket: CombinedBucket) =>
        combinedBucket?.facetBucket?.[variable] || 0

    const groupIds = sortOptions[grouping]

    const bucketDimensions: BucketDimension[] = []
    let groupOffset = 0

    const numberOfGroups = groupIds.length
    const itemsPerGroup = 3
    groupIds.forEach((groupId, groupIndex) => {
        const bucketType = grouping === GroupingOptions.EXPERIENCE ? 'bucket' : 'facetBucket'
        const groupBuckets = sortedBuckets.filter(bucket => bucket[bucketType].id === groupId)
        // account for gaps in between each item for all previous groups
        const itemGapSpace = groupIndex * ITEM_GAP_PERCENT * (itemsPerGroup - 1)
        // to calculate how much to offset this group from the *left axis*,
        // use the sum of maxValues for all *previous* groups
        groupOffset =
            sum(
                take(
                    maxValues.map(m => m.maxValue + COLUMN_GAP_PERCENT),
                    groupIndex
                )
            ) + itemGapSpace

        groupBuckets.forEach((combinedBucket, combinedBucketIndex) => {
            const { id } = combinedBucket
            const width = getWidth(combinedBucket)
            // to calculate how much to offset this item from the *start of the group*,
            // sum the widths of all previous items in the group
            const itemOffset = sum(
                take(groupBuckets, combinedBucketIndex).map(b => getWidth(b) + ITEM_GAP_PERCENT)
            )
            const offset = groupOffset + itemOffset
            bucketDimensions.push({ id, width, offset })
        })
    })

    // with the additional offsets the total of all values will exceed 100%
    // calculate coefficient to bring it back to 100%
    const total =
        sum(maxValues.map(v => v.maxValue)) +
        COLUMN_GAP_PERCENT * numberOfGroups +
        ITEM_GAP_PERCENT * (itemsPerGroup - 1)
    const coefficient = 100 / total
    const bucketDimensionsRatioed = bucketDimensions.map(({ id, width, offset }) => ({
        id,
        width: width * coefficient,
        offset: offset * coefficient
    }))
    // const percentValuesWithSpacers = valuesWithSpacers.map(v => (v * 100) / sum(valuesWithSpacers))

    console.log(maxValues)
    console.log(bucketDimensions)
    console.log(total)
    console.log(coefficient)
    console.log(bucketDimensionsRatioed)

    return (
        <div className="multiexp-row">
            <h3 className="multiexp-row-heading">{item.id}</h3>
            <div className="multiexp-items">
                {combinedBuckets.map((combinedBucket, i) => {
                    const bucketDimension = bucketDimensionsRatioed.find(
                        b => b.id === combinedBucket.id
                    )
                    const { offset, width } = bucketDimension
                    return (
                        <>
                            <Item
                                key={item.id + combinedBucket.id}
                                combinedBucket={combinedBucket}
                                chartState={chartState}
                                width={width}
                                offset={offset}
                            />
                            {/* {addSpacer && <div className="spacer" />} */}
                        </>
                    )
                })}
            </div>
        </div>
    )
}
