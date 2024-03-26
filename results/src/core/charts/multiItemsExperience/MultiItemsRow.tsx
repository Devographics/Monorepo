import React from 'react'
import { ChartState, CombinedBucket, CombinedItem, GroupingOptions, MaxValue } from './types'
import {
    getCellDimensions,
    getGroupedTotals,
    getRowOffset,
    sortByExperience,
    sortBySentiment
} from './helpers'
import { Cell, ColumnTotal } from './MultiItemsCell'
import { sortOptions } from './MultiItemsBlock'
import { RowWrapper } from '../common2/RowWrapper'
import { Bucket } from '@devographics/types'
import { ColumnModes } from '../common2/types'

export const Row = (props: {
    items: CombinedItem[]
    item: CombinedItem
    maxValues: MaxValue[]
    chartState: ChartState
}) => {
    const { items, item, maxValues, chartState } = props
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

    const bucket = item as unknown as Bucket

    console.log(groupedTotals)

    const rowOffset = getRowOffset({ items, item, chartState })
    console.log(rowOffset)
    return (
        <RowWrapper {...props} bucket={bucket} chartState={chartState}>
            <>
                <div className="multiexp-cells">
                    {combinedBuckets.map((combinedBucket, i) => {
                        if (combinedBucket.value === 0) {
                            return null
                        }
                        const cellDimension = cellDimensions.find(d => d.id === combinedBucket.id)
                        if (!cellDimension) {
                            return null
                        }
                        const { offset, width, columnId } = cellDimension || {}
                        return (
                            <>
                                <Cell
                                    key={item.id + combinedBucket.id + i}
                                    combinedBucket={combinedBucket}
                                    chartState={chartState}
                                    width={width}
                                    offset={offset - rowOffset}
                                    groupedTotals={groupedTotals}
                                    columnId={columnId}
                                />
                            </>
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
                                offset={offset - rowOffset}
                            />
                        )
                    })}
                </div>
            </>
        </RowWrapper>
    )
}
