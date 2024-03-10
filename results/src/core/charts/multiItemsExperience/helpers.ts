import {
    Bucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sumBy from 'lodash/sumBy'
import {
    CellDimension,
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
        totals[columnId] = sumBy(relevantBuckets, b => b.value || 0)
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

const ITEM_GAP_PERCENT = 1
const COLUMN_GAP_PERCENT = 5
export const sortBySentiment = (sourceArray: CombinedBucket[]) =>
    sortByArray(sourceArray, sentimentOrder, b => b.facetBucket.id)

export const getCellDimensions = ({
    sortedBuckets,
    columnIds,
    grouping,
    shouldSeparateColumns,
    maxValues,
    variable
}: {
    sortedBuckets: CombinedBucket[]
    columnIds: ColumnId[]
    grouping: GroupingOptions
    shouldSeparateColumns: boolean
    maxValues: MaxValue[]
    variable: Variable
}): CellDimension[] => {
    let cellDimensions: CellDimension[] = []
    let groupOffset = 0
    const numberOfGroups = columnIds.length
    // TODO: calculate this dynamically
    const itemsPerGroup = 3

    const getWidth = (combinedBucket: CombinedBucket) =>
        combinedBucket?.facetBucket?.[variable] || 0

    columnIds.forEach((columnId, columnIndex) => {
        const bucketType = grouping === GroupingOptions.EXPERIENCE ? 'bucket' : 'facetBucket'
        const groupBuckets = sortedBuckets.filter(bucket => bucket[bucketType].id === columnId)
        // account for gaps in between each item for all previous groups
        const itemGapSpace = columnIndex * ITEM_GAP_PERCENT * itemsPerGroup
        // to calculate how much to offset this group from the *left axis*,
        // use the sum of maxValues for all *previous* groups
        groupOffset = shouldSeparateColumns
            ? sum(
                  take(
                      maxValues.map(m => m.maxValue + COLUMN_GAP_PERCENT),
                      columnIndex
                  )
              ) + itemGapSpace
            : sum(take(sortedBuckets, columnIndex * itemsPerGroup).map(b => b.value)) + itemGapSpace

        groupBuckets.forEach((combinedBucket, combinedBucketIndex) => {
            const { id } = combinedBucket
            const width = getWidth(combinedBucket)
            // to calculate how much to offset this item from the *start of the group*,
            // sum the widths of all previous items in the group
            const itemOffset = sum(
                take(groupBuckets, combinedBucketIndex).map(b => getWidth(b) + ITEM_GAP_PERCENT)
            )
            const offset = groupOffset + itemOffset
            cellDimensions.push({ id, width, offset })
        })
    })

    // with the additional gaps and offsets the total of all values will exceed 100%,
    // so calculate coefficient to bring it back to 100%

    // total space occupied by each column
    const columnsTotal = shouldSeparateColumns ? sum(maxValues.map(v => v.maxValue)) : 100

    // total space occupied by the gaps between each column
    const columnGapTotal = shouldSeparateColumns ? COLUMN_GAP_PERCENT * numberOfGroups : 0

    // total space occupied by the gaps between each cell
    const cellGapTotal = ITEM_GAP_PERCENT * itemsPerGroup * numberOfGroups

    const total = columnsTotal + columnGapTotal + cellGapTotal
    const coefficient = 100 / total
    cellDimensions = cellDimensions.map(({ id, width, offset }) => ({
        id,
        width: width * coefficient,
        offset: offset * coefficient
    }))

    return cellDimensions
}
