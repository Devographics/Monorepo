import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    QuestionMetadata,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sumBy from 'lodash/sumBy'
import {
    CellDimension,
    MultiItemsChartState,
    MultiItemsChartValues,
    ColumnId,
    CombinedBucket,
    CombinedItem,
    DEFAULT_VARIABLE,
    Dimension,
    GroupingOptions,
    MaxValue,
    Totals,
    Variable,
    COMMENTS,
    ValueKey,
    CountKey
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

export const getBuckets = (item: StandardQuestionData) => {
    const buckets = item?.responses?.currentEdition?.buckets
    if (!buckets) {
        console.warn('Could not find buckets for item:')
        console.log(item)
        return []
    }
    return buckets
}

export const getCommentsCount = (item: StandardQuestionData) =>
    item?.comments?.currentEdition?.count || 0

export const combineItems = ({
    items,
    variable
}: {
    items: StandardQuestionData[]
    variable: Variable
}): CombinedItem[] =>
    items.map(item => ({
        id: item.id,
        _metadata: item._metadata,
        entity: item.entity,
        combinedBuckets: combineBuckets(getBuckets(item), variable),
        commentsCount: getCommentsCount(item),
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
                    count: facetBucket.count || 0,
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
        if (sort === COMMENTS) {
            return item.commentsCount
        } else {
            return groupedTotals.find(total => total.id === item.id)?.[getValueKey(sort)]
        }
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

const VALUE_SUFFIX = '__value'
const COUNT_SUFFIX = '__count'

export const getValueKey = (columnId: ColumnId) => `${columnId}${VALUE_SUFFIX}` as ValueKey
export const getCountKey = (columnId: ColumnId) => `${columnId}${COUNT_SUFFIX}` as CountKey

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
        totals[getValueKey(columnId)] = round(
            sumBy(relevantBuckets, b => b.value || 0),
            1
        )
        totals[getCountKey(columnId)] = round(
            sumBy(relevantBuckets, b => b.count || 0),
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
    grouping: MultiItemsChartState['grouping']
}) => {
    // if this is the first bucket of the subgroup (i.e. previous bucket belongs to a different subgroup),
    // add column gap to its offset
    const previousBucket = buckets[bucketIndex - 1]
    const getRelevantId = (bucket: CombinedBucket) =>
        bucket.ids[grouping === GroupingOptions.EXPERIENCE ? 0 : 1]
    const addGapBefore = previousBucket && getRelevantId(previousBucket) !== getRelevantId(bucket)
    return addGapBefore ? COLUMN_GAP_PERCENT : 0.3
}

export const getCellDimensions = ({
    buckets,
    chartState
}: {
    buckets: CombinedBucket[]
    chartState: MultiItemsChartState
}) => {
    const { variable, grouping } = chartState
    let cellDimensions: CellDimension[] = []

    const getWidth = (combinedBucket: CombinedBucket) =>
        combinedBucket?.facetBucket?.[variable] || 0

    // keep track of total value to offset cells by
    let cellOffset = 0

    buckets.forEach((bucket, bucketIndex) => {
        const { id, ids } = bucket
        const width = getWidth(bucket)
        cellOffset += getColumnGap({ buckets, bucket, bucketIndex, grouping })
        const offset =
            sum(take(buckets, bucketIndex).map(bucket => getWidth(bucket) + ITEM_GAP_PERCENT)) +
            cellOffset
        cellDimensions.push({ id, ids, width, offset })
    })

    // total row width will expand above 100 due to item gap spacers or divergent sorts
    // bring it back to 100 by calculating the appropriate ratio
    const totalWidth =
        sum(cellDimensions.map(cd => cd.width)) +
        ITEM_GAP_PERCENT * (cellDimensions.length - 1) +
        cellOffset
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
    chartState: MultiItemsChartState
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

export const applyRatio = <T extends Dimension>(cellDimensions: T[], ratio: number) =>
    cellDimensions.map(({ width, offset, ...rest }) => ({
        ...rest,
        width: round(width * ratio, 1),
        offset: round(offset * ratio, 1)
    }))

export const applyRowsLimit = (rowsLimit: number, totalRows: number) =>
    rowsLimit && rowsLimit + 3 < totalRows

export const useChartState = (defaultState?: {
    [P in keyof MultiItemsChartState]?: MultiItemsChartState[P]
}) => {
    const [rowsLimit, setRowsLimit] = useState<MultiItemsChartState['rowsLimit']>(
        defaultState?.rowsLimit || 0
    )
    const [grouping, setGrouping] = useState<MultiItemsChartState['grouping']>(
        GroupingOptions.EXPERIENCE
    )
    const [sort, setSort] = useState<MultiItemsChartState['sort']>(FeaturesOptions.USED)
    const [filter, setFilter] = useState<MultiItemsChartState['filter']>()
    const [order, setOrder] = useState<MultiItemsChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<MultiItemsChartState['variable']>(DEFAULT_VARIABLE)
    const [columnMode, setColumnMode] = useState<MultiItemsChartState['columnMode']>(
        ColumnModes.STACKED
    )
    const [facetId, setFacetId] = useState<MultiItemsChartState['facetId']>('sentiment')

    const chartState: MultiItemsChartState = {
        facetId,
        setFacetId,
        grouping,
        setGrouping,
        sort,
        setSort,
        filter,
        setFilter,
        order,
        setOrder,
        variable,
        setVariable,
        columnMode,
        setColumnMode,
        rowsLimit,
        setRowsLimit
    }
    return chartState
}

export const useChartValues = ({
    items,
    chartState,
    question
}: {
    items: CombinedItem[]
    chartState: MultiItemsChartState
    question: QuestionMetadata
}) => {
    const chartValues: MultiItemsChartValues = {
        totalRows: items.length,
        question,
        facetQuestion: {
            id: '_sentiment'
        } as QuestionMetadata
    }
    return chartValues
}
