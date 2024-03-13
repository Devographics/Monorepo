import {
    Bucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sumBy from 'lodash/sumBy'
import {
    CellDimension,
    ColumnDimension,
    ColumnId,
    CombinedBucket,
    CombinedItem,
    GroupingOptions,
    MaxValue,
    OrderOptions,
    Totals,
    Variable
} from './types'
import sortBy from 'lodash/sortBy'
import max from 'lodash/max'
import sum from 'lodash/sum'
import take from 'lodash/take'
import round from 'lodash/round'

export const ITEM_GAP_PERCENT = 1
export const COLUMN_GAP_PERCENT = 5
export const MINIMUM_COLUMN_WIDTH_PERCENT = 25

export const getBuckets = (item: StandardQuestionData) => item.responses.currentEdition.buckets

export const combineItems = ({
    items,
    variable
}: {
    items: StandardQuestionData[]
    variable: Variable
}): CombinedItem[] =>
    items.map(item => ({
        id: item.id,
        entity: item.entity,
        combinedBuckets: combineBuckets(getBuckets(item), variable)
    }))

export const combineBuckets = (buckets: Bucket[], variable: Variable): CombinedBucket[] =>
    buckets
        .map(bucket =>
            bucket.facetBuckets.map(facetBucket => ({
                // combined string id
                id: `${bucket.id}__${facetBucket.id}`,
                // also keep track of ids combined to create the bucket
                ids: [bucket.id, facetBucket.id],
                bucket,
                facetBucket,
                value: facetBucket[variable] || 0
            }))
        )
        .flat()

/*

We sort items based on the sum of e.g. all the buckets that have
"never_heard" in their id, all the buckets that have "positive" in their id, etc. 

*/
export const sortItems = ({
    combinedItems,
    sort,
    order,
    groupedTotals
}: {
    combinedItems: CombinedItem[]
    sort: ColumnId
    order: OrderOptions
    groupedTotals: Totals[]
}) => {
    let sortedItems = sortBy(combinedItems, item => {
        return groupedTotals.find(total => total.id === item.id)?.[sort]
    })
    if (order === OrderOptions.DESC) {
        sortedItems = sortedItems.toReversed()
    }
    return sortedItems
}

/*

For regular buckets: return value of variable for each bucket ids

For facet buckets: calculate sum of all matching facet buckets for each bucket ids

*/
export const getItemTotals = ({
    combinedItems,
    columnIds
}: {
    combinedItems: CombinedItem[]
    columnIds: ColumnId[]
}) => combinedItems.map(item => getGroupedTotals({ item, columnIds }))

export const getGroupedTotals = ({
    item,
    columnIds
}: {
    item: CombinedItem
    columnIds: ColumnId[]
}) => {
    const totals = { id: item.id } as Totals
    columnIds.forEach(columnId => {
        const relevantBuckets = item.combinedBuckets.filter(b => b.ids.includes(columnId))
        totals[columnId] = round(
            sumBy(relevantBuckets, b => b.value || 0),
            1
        )
    })
    return totals
}

export const getMaxValues = ({
    groupedTotals,
    columnIds
}: {
    groupedTotals: Totals[]
    columnIds: ColumnId[]
}): MaxValue[] =>
    columnIds.map(columnId => {
        const columnMax = max(groupedTotals.map(total => total[columnId]))
        return { id: columnId, maxValue: columnMax || 0 }
    })

export const experienceOrder = Object.values(FeaturesOptions)
export const sentimentOrder = Object.values(SimplifiedSentimentOptions)

export const sortByArray = (
    sourceArray: CombinedBucket[],
    sortArray: typeof experienceOrder | typeof sentimentOrder,
    idGetter: (b: CombinedBucket) => string
) => {
    const sortedArray = [...sourceArray]
    sortedArray.sort(
        (a: CombinedBucket, b: CombinedBucket) =>
            sortArray.indexOf(idGetter(a) as never) - sortArray.indexOf(idGetter(b) as never)
    )
    return sortedArray
}

export const sortByExperience = (sourceArray: CombinedBucket[]) =>
    sortByArray(sourceArray, experienceOrder, b => b.bucket.id)

export const sortBySentiment = (sourceArray: CombinedBucket[]) =>
    sortByArray(sourceArray, sentimentOrder, b => b.facetBucket.id)

export const getColumnDimensions = ({
    shouldSeparateColumns,
    maxValues
}: {
    shouldSeparateColumns: boolean
    maxValues: MaxValue[]
}) => {
    // TODO: calculate this dynamically
    const itemsPerGroup = 3

    let columnDimensions: ColumnDimension[] = maxValues.map(({ id, maxValue }, columnIndex) => {
        if (shouldSeparateColumns) {
            // account for gaps in between each item for all previous groups
            const itemGapSpace = columnIndex * ITEM_GAP_PERCENT * itemsPerGroup
            const offset =
                sum(
                    take(
                        maxValues.map(m => m.maxValue + COLUMN_GAP_PERCENT),
                        columnIndex
                    )
                ) + itemGapSpace
            const width =
                Math.max(MINIMUM_COLUMN_WIDTH_PERCENT, maxValue) +
                ITEM_GAP_PERCENT * (itemsPerGroup - 1)
            return { id, offset, width }
        } else {
            const width = 33.3
            const offset = (33.3 + COLUMN_GAP_PERCENT) * columnIndex
            return { id, offset, width }
        }
    })

    const ratio = getDimensionRatio(columnDimensions)

    columnDimensions = columnDimensions.map(({ width, offset, ...rest }) => ({
        ...rest,
        width: round(width * ratio, 1),
        offset: round(offset * ratio, 1)
    }))

    return { columnDimensions, ratio }
}

const getDimensionRatio = (columnDimensions: ColumnDimension[]) => {
    const total = (columnDimensions.at(-1)?.width || 0) + (columnDimensions.at(-1)?.offset || 0)
    const ratio = 100 / total
    return ratio
}

export const getCellDimensions = ({
    sortedBuckets,
    columnIds,
    shouldSeparateColumns,
    maxValues,
    variable
}: {
    sortedBuckets: CombinedBucket[]
    columnIds: ColumnId[]
    shouldSeparateColumns: boolean
    maxValues: MaxValue[]
    variable: Variable
}) => {
    let cellDimensions: CellDimension[] = []
    let columnOffset = 0
    const numberOfGroups = columnIds.length
    // TODO: calculate this dynamically
    const itemsPerGroup = 3

    const getWidth = (combinedBucket: CombinedBucket) =>
        combinedBucket?.facetBucket?.[variable] || 0

    columnIds.forEach((columnId, columnIndex) => {
        const columnBuckets = sortedBuckets.filter(bucket => bucket.ids.includes(columnId))
        // account for gaps in between each item for all previous groups
        const itemGapSpace = columnIndex * ITEM_GAP_PERCENT * itemsPerGroup
        // to calculate how much to offset this group from the *left axis*,
        // use the sum of maxValues for all *previous* groups
        columnOffset = shouldSeparateColumns
            ? sum(
                  take(
                      maxValues.map(m => m.maxValue + COLUMN_GAP_PERCENT),
                      columnIndex
                  )
              ) + itemGapSpace
            : sum(take(sortedBuckets, columnIndex * itemsPerGroup).map(b => b.value)) + itemGapSpace

        columnBuckets.forEach((combinedBucket, combinedBucketIndex) => {
            const { id, ids } = combinedBucket
            const width = getWidth(combinedBucket)
            // to calculate how much to offset this item from the *start of the group*,
            // sum the widths of all previous items in the group
            const itemOffset = sum(
                take(columnBuckets, combinedBucketIndex).map(b => getWidth(b) + ITEM_GAP_PERCENT)
            )
            const offset = columnOffset + itemOffset
            cellDimensions.push({ id, ids, width, offset, columnId })
        })
    })

    const { ratio } = getColumnDimensions({ maxValues, shouldSeparateColumns })

    cellDimensions = cellDimensions.map(({ width, offset, ...rest }) => ({
        ...rest,
        width: round(width * ratio, 1),
        offset: round(offset * ratio, 1)
    }))

    return cellDimensions
}
