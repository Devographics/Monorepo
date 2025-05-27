import React from 'react'
import {
    CellDimension,
    MultiItemsChartState,
    CombinedItem,
    MaxValue,
    CombinedBucket,
    Totals
} from './types'
import { combineBuckets, getGroupedTotals } from './helpers/helpers'
import { MultiItemsCell, ColumnTotal } from './MultiItemsCell'
import { RowWrapper } from '../horizontalBar2/rows/RowWrapper'
import { Bucket, FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { RespondentCount } from '../common2'
import { Comments } from '../common2/Comments'
import { sortOptions } from './MultiItemsSerie'
import { BlockVariantDefinition } from 'core/types'
import { CommentsTrigger } from '../common2/comments/CommentsTrigger'

type MultiItemsRowProps = {
    block: BlockVariantDefinition
    allRowsCellDimensions: CellDimension[][]
    allRowOffsets: number[]
    rowIndex: number
    item: CombinedItem
    maxValues: MaxValue[]
    chartState: MultiItemsChartState
}
export const MultiItemsRow = (props: MultiItemsRowProps) => {
    const { block, rowIndex, allRowsCellDimensions, allRowOffsets, item, chartState } = props
    const { grouping } = chartState
    const { combinedBuckets } = item

    const columnIds = sortOptions[grouping]

    const cellDimensions = allRowsCellDimensions[rowIndex]

    const groupedTotals = getGroupedTotals({ item, columnIds })

    const bucket = item as unknown as Bucket

    const rowOffset = allRowOffsets[rowIndex]

    const cellsProps = {
        item,
        combinedBuckets,
        cellDimensions,
        chartState,
        rowOffset,
        groupedTotals
    }
    return (
        <RowWrapper
            {...props}
            bucket={bucket}
            chartState={chartState}
            rowMetadata={
                <>
                    <RespondentCount count={bucket.count} />
                    <CommentsTrigger
                        block={block}
                        questionId={item.id}
                        entity={item.entity}
                        commentsCount={item.commentsCount}
                    />
                </>
            }
        >
            <>
                <MultiItemsCells {...cellsProps} />
                <MultiItemsColumnTotals {...cellsProps} columnIds={columnIds} />
            </>
        </RowWrapper>
    )
}

type CellsProps = {
    item: CombinedItem
    combinedBuckets: CombinedBucket[]
    cellDimensions: CellDimension[]
    chartState: MultiItemsChartState
    rowOffset: number
    groupedTotals: Totals
}

const MultiItemsCells = ({
    item,
    combinedBuckets,
    cellDimensions,
    chartState,
    rowOffset,
    groupedTotals
}: CellsProps) => {
    return (
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
                        <MultiItemsCell
                            key={`${item.id}__${combinedBucket.id}`}
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
    )
}
const MultiItemsColumnTotals = ({
    columnIds,
    cellDimensions,
    groupedTotals,
    rowOffset,
    chartState
}: CellsProps & { columnIds: FeaturesOptions[] | SimplifiedSentimentOptions[] }) => {
    return (
        <div className="multiexp-column-totals">
            {columnIds.map((columnId, i) => {
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
                        key={columnId + i}
                        columnId={columnId}
                        groupedTotals={groupedTotals}
                        width={width}
                        offset={offset - rowOffset}
                        chartState={chartState}
                    />
                )
            })}
        </div>
    )
}
