import { useState, useEffect } from 'react'
import sumBy from 'lodash/sumBy'
import {
    ExplorerDataBucket,
    ExplorerDataFacet,
    Key,
    AxisType,
    Total,
    UnitType,
    DotType
} from './types'
import { TOTAL_DOTS, INCREMENT, GAP, GRID_WIDTH } from './constants'
import variables from 'Config/variables.yml'
import { Bucket, FacetBucket } from '@devographics/types'
import { NO_ANSWER } from '@devographics/constants'

// https://stackoverflow.com/a/36862446/649299
const getWindowDimensions = () => {
    if (typeof window !== 'undefined') {
        const { innerWidth: width, innerHeight: height } = window
        return {
            width,
            height
        }
    } else {
        return {}
    }
}

export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        typeof window !== 'undefined' && window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}

/* 

Find bucket containing the most items

*/
export const getMaxBucketCount = (facets: ExplorerDataFacet[]) => {
    let maxBucketCount = 0
    facets.forEach(f => {
        f.buckets.forEach(b => {
            if (b.count > maxBucketCount) {
                maxBucketCount = b.count
            }
        })
    })
    return maxBucketCount
}

/*

Get grid parameters

*/
export const getParameters = ({
    facets,
    xKeys,
    yKeys
}: {
    facets: ExplorerDataFacet[]
    xKeys: Key[]
    yKeys: Key[]
}) => {
    const maxBucketCount = getMaxBucketCount(facets)
    const columnCount = xKeys.length
    const rowCount = yKeys.length
    const cellWidth = Math.floor((GRID_WIDTH - (columnCount - 1) * GAP) / columnCount)
    const maxDotsPerLine = Math.floor(cellWidth / INCREMENT)
    const columnWidth = maxDotsPerLine * INCREMENT
    return {
        gap: GAP,
        columnCount,
        rowCount,
        cellWidth,
        maxDotsPerLine,
        columnWidth,
        maxBucketCount
    }
}

// export const addExtraCounts = (facets: ExplorerDataFacet[]) => {
//     let facetRunningCount = 0,
//         bucketRunningCount = 0
//     const facetsWithCounts = facets.map((f: ExplorerDataFacet, i: number) => {
//         f.fromCount = facetRunningCount
//         facetRunningCount += f.completion.count
//         f.toCount = facetRunningCount
//         f.rowIndex = i
//         f.buckets.forEach((b: ExplorerDataBucket, j: number) => {
//             b.fromCount = bucketRunningCount
//             bucketRunningCount += b.count
//             b.toCount = bucketRunningCount
//             b.columnIndex = j
//         })
//         return f
//     })
//     return facetsWithCounts
// }

export const isBetween = (i: number, lowerBound = 0, upperBound = 0) => {
    return lowerBound <= i && i <= upperBound
}

const getOptGroups = (categories: any) => {
    return Object.keys(categories).map(id => {
        return { id, fields: categories[id] }
    })
}

export const getSelectorItems = () => {
    const selectorItems = [
        {
            id: 'demographics',
            optGroups: [
                {
                    id: 'all_fields',
                    fields: [
                        'age',
                        'years_of_experience',
                        'company_size',
                        'higher_education_degree',
                        'yearly_salary',
                        'gender',
                        'race_ethnicity',
                        'disability_status'
                    ]
                }
            ]
        },
        { id: 'features', optGroups: getOptGroups(variables.featuresCategories) },
        { id: 'tools', optGroups: getOptGroups(variables.toolsCategories) }
    ]
    return selectorItems
}

export const getTotals = ({
    buckets,
    axis,
    keys,
    totalCount
}: {
    buckets: Bucket[]
    axis: AxisType
    keys: Key[]
    totalCount: number
}): Total[] => {
    if (axis === 'x') {
        return keys.map((key: Key) => {
            const total = sumBy(buckets, (bucket: Bucket) => {
                const facetBucket = bucket.facetBuckets.find(b => b.id === key)
                return facetBucket?.count || 0
            })
            return {
                id: key,
                count: total,
                percentage: Math.floor((total * 100) / totalCount)
            }
        })
    } else {
        return buckets.map(({ id, count }) => ({
            id,
            count: count || 0,
            percentage: Math.floor((count * 100) / totalCount)
        }))
    }
}

/*

Get all data for a single cell when we already know its facet (row)

*/
export interface CellData {
    dots: Dot[]
    dotsCount: number
    columnCount: number
    rowCount: number
    xAxisTotal: Total
    yAxisTotal: Total
    // facetPercentageQuestion: number
    // facetPercentageSurvey: number
    cellCount: number
    bucketPercentage: number
    normalizedCount: number
    normalizedCountDelta: number
    normalizedPercentageDelta: number
}

export const getCellData = (options: {
    facetBucket: FacetBucket
    xTotals: Total[]
    yTotals: Total[]
    xIndex: number
    yIndex: number
    respondentsPerDot: number
    percentsPerDot: number
    dotsPerLine: number
    unit: UnitType
    totalCount: number
}): CellData => {
    const {
        facetBucket,
        xTotals,
        yTotals,
        xIndex,
        yIndex,
        respondentsPerDot,
        percentsPerDot,
        dotsPerLine,
        unit
    } = options

    // x axis (axis1) total corresponding to this cell
    const xAxisTotal = xTotals?.at(xIndex) as Total
    // y axis (axis2) total corresponding to this cell
    const yAxisTotal = yTotals?.at(yIndex) as Total

    // number of respondents in this cell (= in this facetBucket)
    const cellCount = facetBucket.count

    // what percentage of question respondents are represented by this facet
    // const facetPercentageQuestion = facetBucket.percentageQuestion

    // percentage of bucket relative to current facet (row)
    const bucketPercentageFacet = facetBucket?.percentageFacet

    // percentage of respondents in column
    const normalizedPercentage = xAxisTotal.percentage
    // delta with bucketPercentageFacet
    const normalizedPercentageDelta = bucketPercentageFacet - normalizedPercentage

    // expected count based on row count times normalizedPercentage
    const normalizedCount = (yAxisTotal.count * normalizedPercentage) / 100
    // delta with cellCount
    const normalizedCountDelta = cellCount - normalizedCount

    const dots = getCellDots({
        facetBucket,
        normalizedCount,
        normalizedPercentage,
        respondentsPerDot,
        percentsPerDot,
        unit
    })

    const dotsCount = dots.length
    const columnCount = dotsPerLine
    const rowCount = Math.ceil(dotsCount / columnCount)

    return {
        dots,
        dotsCount,
        columnCount,
        rowCount,
        xAxisTotal,
        yAxisTotal,
        cellCount: cellCount,
        bucketPercentage: bucketPercentageFacet,
        normalizedCount,
        normalizedCountDelta,
        normalizedPercentageDelta
    }
}

/*

Get the dots for a single cell of the grid

*/
export enum DotTypes {
    ERROR = 'error',
    NORMAL = 'normal',
    EXTRA = 'extra',
    MISSING = 'missing'
}
export interface Dot {
    index: number
    type: DotTypes
}
export const getCellDots = ({
    facetBucket,
    normalizedCount,
    normalizedPercentage,
    respondentsPerDot,
    percentsPerDot,
    unit
}: {
    facetBucket: FacetBucket
    normalizedCount: number
    normalizedPercentage: number
    respondentsPerDot: number
    percentsPerDot: number
    unit: UnitType
}): Dot[] => {
    console.log('// getCellDots')
    console.log({
        facetBucket,
        normalizedCount,
        normalizedPercentage,
        respondentsPerDot,
        percentsPerDot,
        unit
    })
    try {
        if (unit === 'count') {
            // find the right bucket for the current cell based on its xIndex (column index)
            const peopleCount = Math.max(normalizedCount, facetBucket.count)
            const dotCount = Math.floor(peopleCount / respondentsPerDot)
            return [...Array(dotCount)].map((x, index) => {
                const peopleInDot = index * respondentsPerDot
                let type = DotTypes.ERROR
                if (peopleInDot <= facetBucket.count && peopleInDot <= normalizedCount) {
                    type = DotTypes.NORMAL
                } else if (peopleInDot <= facetBucket.count) {
                    type = DotTypes.EXTRA
                } else if (peopleInDot <= normalizedCount) {
                    type = DotTypes.MISSING
                }
                return { index, type }
            })
        } else {
            // find the right bucket for the current cell based on its xIndex (column index)
            const percentCount = Math.max(normalizedPercentage, facetBucket.percentageFacet)
            const dotCount = Math.floor(percentCount / percentsPerDot)
            return [...Array(dotCount)].map((x, index) => {
                const percentsInDot = index * percentsPerDot
                let type = DotTypes.ERROR
                if (
                    percentsInDot <= facetBucket.percentageFacet &&
                    percentsInDot <= normalizedPercentage
                ) {
                    type = DotTypes.NORMAL
                } else if (percentsInDot <= facetBucket.percentageFacet) {
                    type = DotTypes.EXTRA
                } else if (percentsInDot <= normalizedPercentage) {
                    type = DotTypes.MISSING
                }
                return { index, type }
            })
        }
    } catch (error) {
        return []
    }
}
