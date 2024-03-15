import React from 'react'
import {
    ChartState,
    ColumnModes,
    CombinedBucket,
    CombinedItem,
    GroupingOptions,
    MaxValue
} from './types'
import { getCellDimensions, getGroupedTotals, sortByExperience, sortBySentiment } from './helpers'
import { Cell, ColumnTotal } from './MultiItemsCell'
import { sortOptions } from './MultiItemsBlock'
import { RowWrapper } from '../common2/RowWrapper'
import { Bucket, BucketMetadata } from '@devographics/types'

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
    const shouldSeparateColumns = columnMode === ColumnModes.SPLIT
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
        shouldSeparateColumns,
        maxValues,
        variable
    })

    const groupedTotals = getGroupedTotals({ item, columnIds })

    return (
        <RowWrapper bucket={item as unknown as Bucket} chartState={chartState}>
            <div className="multiexp-cells">
                {combinedBuckets.map((combinedBucket, i) => {
                    const cellDimension = cellDimensions.find(d => d.id === combinedBucket.id)
                    if (!cellDimension) {
                        return null
                    }
                    const { offset, width, columnId } = cellDimension || {}
                    return (
                        <Cell
                            key={item.id + combinedBucket.id + i}
                            combinedBucket={combinedBucket}
                            chartState={chartState}
                            width={width}
                            offset={offset}
                            groupedTotals={groupedTotals}
                            columnId={columnId}
                        />
                    )
                })}
            </div>

            <div className="multiexp-column-totals">
                {columnIds.map(columnId => {
                    const cellsInColumn = cellDimensions.filter(d => d.ids.includes(columnId))
                    const firstCellInColumn = cellsInColumn.at(0)
                    const lastCellInColumn = cellsInColumn.at(-1)
                    const width =
                        (lastCellInColumn?.offset || 0) +
                        (lastCellInColumn?.width || 0) -
                        (firstCellInColumn?.offset || 0)
                    const offset = firstCellInColumn?.offset || 0

                    return (
                        <ColumnTotal
                            key={columnId}
                            columnId={columnId}
                            groupedTotals={groupedTotals}
                            width={width}
                            offset={offset}
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}
