import React from 'react'
import './MultiItemsExperience.scss'
import { ChartState, CombinedBucket, CombinedItem, GroupingOptions, Totals } from './types'
import { sortByExperience, sortBySentiment } from './helpers'
import { Item } from './MultiItemsExperienceItem'

export const Row = ({
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
