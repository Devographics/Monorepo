import {
    EditionData,
    ComputeAxisParameters,
    RequestContext,
    SortProperty,
    SortOrder,
    SortOrderNumeric,
    Bucket
} from '../types'
import { ratioToPercentage } from './common'
import { getEntity } from '../load/entities'
import sortBy from 'lodash/sortBy.js'
import { CompletionResult } from './completion'
import sum from 'lodash/sum.js'
import sumBy from 'lodash/sumBy.js'
import take from 'lodash/take.js'
import round from 'lodash/round.js'
import difference from 'lodash/difference.js'
import isEmpty from 'lodash/isEmpty.js'

/*

Discard any result where id is {}, "", [], etc. 

*/
export async function discardEmptyIds(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = editionData.buckets.filter(
            b => typeof b.id === 'number' || !isEmpty(b.id)
        )
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = bucket.facetBuckets.filter(
                    b => typeof b.id === 'number' || !isEmpty(b.id)
                )
            }
        }
    }
}

/* 

Add facet limits

For example, when faceting salary by countries we might want to only
keep the top 10 countries; or discard any countries with less than X
respondents or representing less than Y% of respondents

*/
export async function limitFacets(
    resultsByEdition: EditionData[],
    { limit, cutoffPercent, cutoff }: ComputeAxisParameters
) {
    for (let year of resultsByEdition) {
        // if a minimum question percentage/count is specified, filter out
        // any facets that represent less than that
        if (cutoffPercent || cutoff) {
            year.facets = year.facets.filter(f => {
                const abovePercent = cutoffPercent
                    ? f.completion.percentage_question > cutoffPercent
                    : true
                const aboveCount = cutoff ? f.completion.count > cutoff : true
                return abovePercent && aboveCount
            })
        }
        // if a max number of facets is specified, limit list to that
        if (limit) {
            year.facets = take(year.facets, limit)
        }
    }
}

// add means
export async function addMeans(resultsByEdition: EditionData[], values: string[] | number[]) {
    for (let year of resultsByEdition) {
        for (let facet of year.facets) {
            let totalValue = 0
            let totalCount = 0
            const coeffs = values.map((id, index) => ({ id, coeff: index + 1 }))
            facet.buckets.forEach((bucket, index) => {
                const { count, id } = bucket
                const coeff = coeffs.find(c => c.id === id)?.coeff ?? 1
                totalValue += count * coeff
                totalCount += count
            })
            facet.mean = round(totalValue / totalCount, 2)
        }
    }
}

// TODO
// if aggregation has options defined, set any missing value to 0
// so that all buckets have the same shape
export async function addMissingBucketValues(resultsByEdition: EditionData[], options: string[]) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const existingValues = bucket.facetBuckets.map(b => b.id)
            const missingValues = difference(
                options.map(i => i.toString()),
                existingValues.map(i => i.toString())
            )
            missingValues.forEach(id => {
                const zeroBucketItem = {
                    id,
                    count: 0,
                    percentage_question: 0,
                    percentage_facet: 0,
                    percentage_survey: 0,
                    count_all_facets: 0,
                    percentage_all_facets: 0
                }
                bucket.facetBuckets.push(zeroBucketItem)
            })
        }
    }
}

// add entities to facet and bucket items if applicable
export async function addEntities(resultsByEdition: EditionData[], context: RequestContext) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const bucketEntity = await getEntity({ id: bucket.id, context })
            if (bucketEntity) {
                bucket.entity = bucketEntity
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    const facetBucketsEntity = await getEntity({ id: facetBucket.id })
                    if (facetBucketsEntity) {
                        facetBucket.entity = facetBucketsEntity
                    }
                }
            }
        }
    }
}

// add completion counts for each year and facet
export async function addCompletionCounts(
    resultsByEdition: EditionData[],
    totalRespondentsByYear: {
        [key: number]: number
    },
    completionByYear: Record<number, CompletionResult>
) {
    for (let yearObject of resultsByEdition) {
        const totalRespondents = totalRespondentsByYear[yearObject.year] ?? 0
        const questionRespondents = completionByYear[yearObject.year]?.total ?? 0
        yearObject.completion = {
            total: totalRespondents,
            count: questionRespondents,
            percentage_survey: ratioToPercentage(questionRespondents / totalRespondents)
        }
        for (let facet of yearObject.facets) {
            // TODO: not accurate because it doesn't account for
            // respondents who didn't answer the question
            const facetTotal = sumBy(facet.buckets, 'count')
            facet.completion = {
                total: totalRespondents,
                count: facetTotal,
                percentage_question: ratioToPercentage(facetTotal / questionRespondents),
                percentage_survey: ratioToPercentage(facetTotal / totalRespondents)
            }
        }
    }
}

// apply bucket cutoff
export async function applyCutoff(resultsByEdition: EditionData[], cutoff: number = 1) {
    for (let year of resultsByEdition) {
        for (let facet of year.facets) {
            facet.buckets = facet.buckets.filter(bucket => bucket.count >= cutoff)
        }
    }
}

// apply bucket limit
export async function limitBuckets(resultsByEdition: EditionData[], limit: number = 1000) {
    for (let year of resultsByEdition) {
        for (let facet of year.facets) {
            facet.buckets = take(facet.buckets, limit)
        }
    }
}

// add percentages relative to question respondents and survey respondents
export async function addPercentages(resultsByEdition: EditionData[]) {
    for (let year of resultsByEdition) {
        for (let facet of year.facets) {
            for (let bucket of facet.buckets) {
                bucket.percentage_survey = ratioToPercentage(bucket.count / year.completion.total)
                bucket.percentage_question = ratioToPercentage(bucket.count / year.completion.count)
                bucket.percentage_facet = ratioToPercentage(bucket.count / facet.completion.count)

                // const defaultFacetCount
                // const all
                const allCounts = year.facets.map(
                    (f: FacetItem) => f.buckets.find(b => b.id === bucket.id)?.count || 0
                )
                bucket.count_all_facets = sum(allCounts)
                bucket.percentage_all_facets = ratioToPercentage(
                    bucket.count_all_facets / year.completion.count
                )
            }
        }
    }
}

// TODO ? or else remove this
export async function addDeltas(resultsByEdition: EditionData[]) {
    // // compute deltas
    // resultsWithPercentages.forEach((year, i) => {
    //     const previousYear = resultsByYear[i - 1]
    //     if (previousYear) {
    //         year.buckets.forEach(bucket => {
    //             const previousYearBucket = previousYear.buckets.find(b => b.id === bucket.id)
    //             if (previousYearBucket) {
    //                 bucket.countDelta = bucket.count - previousYearBucket.count
    //                 bucket.percentageDelta =
    //                     Math.round(100 * (bucket.percentage - previousYearBucket.percentage)) / 100
    //             }
    //         })
    //     }
    // })
}

export function sortBuckets(buckets: Bucket[], axis: ComputeAxisParameters) {
    const { sort, order, options } = axis
    let sortedBuckets = [...buckets]
    if (sort === 'options') {
        if (options && !isEmpty(options)) {
            // if values are specified, sort by values
            sortedBuckets = sortByOptions(sortedBuckets, options)
        }
    } else {
        sortedBuckets = sortByProperty(sortedBuckets, sort, order)
    }
    return sortedBuckets
}

export function sortByOptions(buckets: Bucket[], options: string[]) {
    return [...buckets].sort((a, b) => {
        // make sure everything is a string to avoid type mismatches
        const stringValues = options.map(v => v.toString())
        return stringValues.indexOf(a.id.toString()) - stringValues.indexOf(b.id.toString())
    })
}

export function sortByProperty(
    buckets: Bucket[],
    sortProperty: SortProperty,
    sortOrder: SortOrderNumeric
) {
    let sortedBuckets = [...buckets]
    // start with an alphabetical sort to ensure a stable
    // sort even when multiple items have same count
    sortedBuckets = sortBy(sortedBuckets, 'id')
    // sort by sort/order
    if (sortOrder === -1) {
        // reverse first so that ids end up in right order when we reverse again
        sortedBuckets.reverse()
        sortedBuckets = sortBy(sortedBuckets, sortProperty)
        sortedBuckets.reverse()
    } else {
        sortedBuckets = sortBy(sortedBuckets, sortProperty)
    }
    return sortedBuckets
}

export async function sortData(
    resultsByEdition: EditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, sort regular buckets
        editionData.buckets = sortBuckets(editionData.buckets, axis1)

        if (axis2) {
            // then, sort facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = sortBuckets(bucket.facetBuckets, axis2)
            }
        }
    }
}
