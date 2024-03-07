import './MultiItemsExperience.scss'
import {
    Bucket,
    FeaturesOptions,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import sumBy from 'lodash/sumBy'
import { ColumnId, CombinedBucket, GroupingOptions, Totals, Variable } from './types'

export const getBuckets = (item: StandardQuestionData) => item.responses.currentEdition.buckets

export const combineBuckets = (buckets: Bucket[]): CombinedBucket[] =>
    buckets
        .map(bucket =>
            bucket.facetBuckets.map(facetBucket => ({
                id: `${bucket.id}__${facetBucket.id}`,
                bucket,
                facetBucket
            }))
        )
        .flat()

/*

For regular buckets: return value of variable for each bucket ids

For facet buckets: calculate sum of all matching facet buckets for each bucket ids

*/
export const getGroupedTotals = ({
    item,
    bucketIds,
    variable,
    grouping
}: {
    item: StandardQuestionData
    bucketIds: ColumnId[]
    variable: Variable
    grouping: GroupingOptions
}) => {
    const totals = { id: item.id } as Totals
    const buckets = getBuckets(item)
    bucketIds.forEach(id => {
        let total
        if (grouping === GroupingOptions.EXPERIENCE) {
            const bucket = buckets.find(b => b.id === id)
            total = bucket?.[variable]
        } else {
            const facetBuckets = buckets
                .map(b => b.facetBuckets)
                .flat()
                .filter(fb => fb.id === id)

            total = sumBy(facetBuckets, variable)
        }
        totals[id] = total || 0
    })
    return totals
}

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
