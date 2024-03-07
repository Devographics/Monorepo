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

export const Row = ({
    item,
    groupedTotals,
    maxValues,
    chartState
}: {
    item: CombinedItem
    groupedTotals: Totals[]
    maxValues: MaxValue[]
    chartState: ChartState
}) => {
    const { grouping, variable } = chartState
    const { combinedBuckets } = item
    let sortedBuckets: CombinedBucket[]
    if (grouping === GroupingOptions.EXPERIENCE) {
        sortedBuckets = sortByExperience(sortBySentiment(combinedBuckets))
    } else {
        sortedBuckets = sortBySentiment(sortByExperience(combinedBuckets))
    }

    const columnIds = sortOptions[grouping]

    let accumulator = 0
    const valuesWithSpacers = sortedBuckets
        .map((bucket, i) => {
            const value = bucket.facetBucket[variable] || 0
            const columnIndex = Math.floor(i / columnIds.length)
            accumulator += value
            const addSpacer = (i + 1) % columnIds.length === 0
            const spacerValue =
                Math.max(Math.floor(maxValues[columnIndex].maxValue - accumulator), 0) + 10
            if (addSpacer) {
                accumulator = 0
            }
            return addSpacer ? [value, spacerValue] : [value]
        })
        .flat()

    const percentValuesWithSpacers = valuesWithSpacers.map(v => (v * 100) / sum(valuesWithSpacers))

    const style = {
        gridTemplateColumns: percentValuesWithSpacers.map(value => `${value}%`).join(' ')
    }

    return (
        <div className="multiexp-row">
            <h3 className="multiexp-row-heading">{item.id}</h3>
            <div className="multiexp-items" style={style}>
                {sortedBuckets.map((combinedBucket, i) => {
                    const addSpacer = (i + 1) % columnIds.length === 0
                    return (
                        <>
                            <Item
                                key={combinedBucket.id}
                                combinedBucket={combinedBucket}
                                chartState={chartState}
                            />
                            {addSpacer && <div className="spacer" />}
                        </>
                    )
                })}
            </div>
        </div>
    )
}
