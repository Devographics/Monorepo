import React from 'react'
import { CellDimension, MultiItemsChartState, CombinedItem, MaxValue } from './types'
import { getGroupedTotals } from './helpers'
import { Cell, ColumnTotal } from './MultiItemsCell'
import { sortOptions } from './MultiItemsBlock'
import { RowWrapper } from '../horizontalBar2/rows/RowWrapper'
import { Bucket } from '@devographics/types'
import { RespondentCount } from '../common2'
import { Comments } from '../common2/Comments'

export const Row = (props: {
    allRowsCellDimensions: CellDimension[][]
    allRowOffsets: number[]
    rowIndex: number
    item: CombinedItem
    maxValues: MaxValue[]
    chartState: MultiItemsChartState
}) => {
    const { question, rowIndex, allRowsCellDimensions, allRowOffsets, item, chartState } = props
    const { grouping } = chartState
    const { combinedBuckets } = item

    const columnIds = sortOptions[grouping]

    const cellDimensions = allRowsCellDimensions[rowIndex]

    const groupedTotals = getGroupedTotals({ item, columnIds })

    const bucket = item as unknown as Bucket

    const rowOffset = allRowOffsets[rowIndex]

    return (
        <RowWrapper
            {...props}
            bucket={bucket}
            chartState={chartState}
            rowMetadata={
                <>
                    <RespondentCount count={bucket.count} />
                    <Comments item={item} count={99} />
                </>
            }
        >
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
                        const { offset, width } = cellDimension || {}

                        return (
                            <>
                                <Cell
                                    key={combinedBucket.id}
                                    combinedBucket={combinedBucket}
                                    chartState={chartState}
                                    width={width}
                                    offset={offset - rowOffset}
                                    groupedTotals={groupedTotals}
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
                        // note: we can't just use the width because it wouldn't account for
                        // item gaps; and we also can't just use ITEM_GAP_PERCENT
                        // because it doesn't have the ratio applied to it
                        const width =
                            (lastCellInColumn?.offset || 0) +
                            (lastCellInColumn?.width || 0) -
                            (firstCellInColumn?.offset || 0)

                        const offset = cellsInColumn[0]?.offset || 0

                        return (
                            <ColumnTotal
                                key={columnId}
                                columnId={columnId}
                                groupedTotals={groupedTotals}
                                width={width}
                                offset={offset - rowOffset}
                                chartState={chartState}
                            />
                        )
                    })}
                </div>
            </>
        </RowWrapper>
    )
}
