import React from 'react'
import {
    ChartState,
    ColumnModes,
    CombinedBucket,
    CombinedItem,
    GroupingOptions,
    MaxValue
} from './types'
import { getCellDimensions, sortByExperience, sortBySentiment } from './helpers'
import { Item } from './MultiItemsExperienceItem'
import { sortOptions } from './MultiItemsExperienceBlock'

export const Row = ({
    item,
    maxValues,
    chartState
}: {
    item: CombinedItem
    maxValues: MaxValue[]
    chartState: ChartState
}) => {
    const { grouping, variable, columnMode } = chartState
    const { combinedBuckets } = item
    const shouldSeparateColumns = columnMode === ColumnModes.SEPARATE
    let sortedBuckets: CombinedBucket[]
    if (grouping === GroupingOptions.EXPERIENCE) {
        sortedBuckets = sortByExperience(sortBySentiment(combinedBuckets))
    } else {
        sortedBuckets = sortBySentiment(sortByExperience(combinedBuckets))
    }

    const columnIds = sortOptions[grouping]

    const cellDimensions = getCellDimensions({
        sortedBuckets,
        columnIds,
        grouping,
        shouldSeparateColumns,
        maxValues,
        variable
    })

    return (
        <div className="multiexp-row">
            <h3 className="multiexp-row-heading">{item.id}</h3>
            <div className="multiexp-items">
                {combinedBuckets.map((combinedBucket, i) => {
                    const cellDimension = cellDimensions.find(b => b.id === combinedBucket.id)
                    const { offset = 0, width = 0 } = cellDimension || {}
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
