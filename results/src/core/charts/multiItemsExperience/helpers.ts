import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sumBy from 'lodash/sumBy'
import {
    CellDimension,
    ChartState,
    ChartValues,
    ColumnId,
    CombinedBucket,
    CombinedItem,
    DEFAULT_VARIABLE,
    GroupingOptions,
    MaxValue,
    Totals,
    Variable
} from './types'
import sortBy from 'lodash/sortBy'
import max from 'lodash/max'
import sum from 'lodash/sum'
import take from 'lodash/take'
import round from 'lodash/round'
import { useState } from 'react'
import { ColumnModes, OrderOptions } from '../common2/types'

export const ITEM_GAP_PERCENT = 0
export const COLUMN_GAP_PERCENT = 2
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
        combinedBuckets: combineBuckets(getBuckets(item), variable),
        count: item?.responses?.currentEdition?.completion?.count || 0
    }))

const sortBucketsById = <T extends Bucket | FacetBucket>(buckets: T[], sortingArray: string[]) =>
    buckets.sort((a, b) => sortingArray.indexOf(a.id) - sortingArray.indexOf(b.id))

export const combineBuckets = (buckets: Bucket[], variable: Variable): CombinedBucket[] =>
    sortBucketsById<Bucket>(buckets, Object.values(FeaturesOptions))
        .map((bucket, groupIndex) =>
            sortBucketsById<FacetBucket>(
                bucket.facetBuckets,
                Object.values(SimplifiedSentimentOptions)
            )
                .filter(facetBucket => facetBucket[variable] || 0 > 0)
                .map((facetBucket, subGroupIndex) => ({
                    // combined string id
                    id: `${bucket.id}__${facetBucket.id}`,
                    // also keep track of ids combined to create the bucket
                    ids: [bucket.id, facetBucket.id],
                    bucket,
                    facetBucket,
                    value: facetBucket[variable] || 0,
                    groupIndex,
                    subGroupIndex
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

export const sortBuckets = (combinedBuckets: CombinedBucket[], grouping: GroupingOptions) => {
    if (grouping === GroupingOptions.EXPERIENCE) {
        return sortByExperience(sortBySentiment(combinedBuckets))
    } else {
        return sortBySentiment(sortByExperience(combinedBuckets))
    }
}

export const getColumnGap = ({
    buckets,
    bucket,
    bucketIndex,
    grouping
}: {
    buckets: CombinedBucket[]
    bucket: CombinedBucket
    bucketIndex: number
    grouping: ChartState['grouping']
}) => {
    // if this is the first bucket of the subgroup (i.e. previous bucket belongs to a different subgroup),
    // add column gap to its offset
    const previousBucket = buckets[bucketIndex - 1]
    const getRelevantId = (bucket: CombinedBucket) =>
        bucket.ids[grouping === GroupingOptions.EXPERIENCE ? 0 : 1]
    const addGapBefore = previousBucket && getRelevantId(previousBucket) !== getRelevantId(bucket)
    return addGapBefore ? COLUMN_GAP_PERCENT : 0
}

export const getCellDimensions = ({
    buckets,
    chartState
}: {
    buckets: CombinedBucket[]
    chartState: ChartState
}) => {
    const { variable, grouping } = chartState
    let cellDimensions: CellDimension[] = []

    const getWidth = (combinedBucket: CombinedBucket) =>
        combinedBucket?.facetBucket?.[variable] || 0

    // keep track of total value to offset column by
    let columnOffset = 0

    buckets.forEach((bucket, bucketIndex) => {
        const { id, ids } = bucket
        const width = getWidth(bucket)
        columnOffset += getColumnGap({ buckets, bucket, bucketIndex, grouping })
        const offset =
            sum(take(buckets, bucketIndex).map(bucket => getWidth(bucket) + ITEM_GAP_PERCENT)) +
            columnOffset
        cellDimensions.push({ id, ids, width, offset })
    })

    // total row width will expand above 100 due to item gap spacers or divergent sorts
    // bring it back to 100 by calculating the appropriate ratio
    const totalWidth =
        sum(cellDimensions.map(cd => cd.width)) +
        ITEM_GAP_PERCENT * (cellDimensions.length - 1) +
        columnOffset
    const ratio = 100 / totalWidth
    cellDimensions = applyRatio(cellDimensions, ratio)
    return cellDimensions
}

/*

Calculate how much to offset a row by to line up whichever column/cell the chart is sorted by

*/
export const getRowOffset = ({
    firstRowCellDimensions,
    cellDimensions,
    chartState
}: {
    firstRowCellDimensions: CellDimension[]
    cellDimensions: CellDimension[]
    chartState: ChartState
}) => {
    const { sort } = chartState

    if (sort) {
        const getOffset = (cellDimensions: CellDimension[]) => {
            const currentCombinedBucketIndex = cellDimensions.findIndex(cd => cd.ids.includes(sort))
            const previousCombinedBuckets = take(cellDimensions, currentCombinedBucketIndex)
            const valuesSum =
                sumBy(previousCombinedBuckets, cb => cb.width) +
                ITEM_GAP_PERCENT * (previousCombinedBuckets.length - 1)
            return valuesSum
        }

        const firstRowOffset = getOffset(firstRowCellDimensions)
        const currentRowOffset = getOffset(cellDimensions)
        return currentRowOffset - firstRowOffset
    } else {
        return 0
    }
}

export const applyRatio = (cellDimensions: CellDimension[], ratio: number) =>
    cellDimensions.map(({ width, offset, ...rest }) => ({
        ...rest,
        width: round(width * ratio, 1),
        offset: round(offset * ratio, 1)
    }))

export const useChartState = () => {
    const [grouping, setGrouping] = useState<ChartState['grouping']>(GroupingOptions.EXPERIENCE)
    const [sort, setSort] = useState<ChartState['sort']>(FeaturesOptions.USED)
    const [order, setOrder] = useState<ChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<ChartState['variable']>(DEFAULT_VARIABLE)
    const [columnMode, setColumnMode] = useState<ChartState['columnMode']>(ColumnModes.STACKED)
    const [facetId, setFacetId] = useState<ChartState['facetId']>('sentiment')

    const chartState: ChartState = {
        facetId,
        setFacetId,
        grouping,
        setGrouping,
        sort,
        setSort,
        order,
        setOrder,
        variable,
        setVariable,
        columnMode,
        setColumnMode
    }
    return chartState
}

export const useChartValues = (buckets: Bucket[], chartState: ChartState) => {
    const { variable } = chartState
    const maxOverallValue = max(buckets.map(b => b[variable])) || 0
    const chartValues: ChartValues = { maxOverallValue }
    return chartValues
}
