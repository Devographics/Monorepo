import React from 'react'
import { ChartState, CombinedBucket, CombinedItem, GroupingOptions, MaxValue } from './types'
import {
    ITEM_GAP_PERCENT,
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
import round from 'lodash/round'
import sum from 'lodash/sum'

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
        buckets: sortedBuckets,
        items,
        variable,
        chartState
    })

    const groupedTotals = getGroupedTotals({ item, columnIds })

    const bucket = item as unknown as Bucket

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
                                    offset={offset}
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
                        const width =
                            sum(cellsInColumn.map(cd => cd.width)) +
                            ITEM_GAP_PERCENT * (cellsInColumn.length - 1)
                        const offset = cellsInColumn[0]?.offset || 0

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
            </>
        </RowWrapper>
    )
}
