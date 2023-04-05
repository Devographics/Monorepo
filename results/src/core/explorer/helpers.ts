import { useState, useEffect } from 'react'
import sumBy from 'lodash/sumBy'
import { Key, AxisType, Total, UnitType } from './types'
import { Bucket, FacetBucket } from '@devographics/types'
import round from 'lodash/round.js'

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

export const isBetween = (i: number, lowerBound = 0, upperBound = 0) => {
    return lowerBound <= i && i <= upperBound
}

export const formatPercentage = (value: number) => {
    if (value < 0.1) {
        return round(value, 2)
    } else if (value < 1) {
        return round(value, 1)
    } else {
        return round(value)
    }
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
                percentage: formatPercentage((total * 100) / totalCount)
            }
        })
    } else {
        return buckets.map(({ id, count }) => ({
            id,
            count: count || 0,
            percentage: formatPercentage((count * 100) / totalCount)
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
    normalizedPercentage: number
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
        normalizedPercentage,
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
    const { count: cellCount } = facetBucket
    try {
        if (unit === 'count') {
            // find the right bucket for the current cell based on its xIndex (column index)
            const peopleCount = Math.max(normalizedCount, cellCount)
            const dotCount = Math.ceil(peopleCount / respondentsPerDot)
            return [...Array(dotCount)].map((x, index) => {
                const peopleInDot = index * respondentsPerDot
                let type = DotTypes.ERROR
                if (peopleInDot <= cellCount && peopleInDot <= normalizedCount) {
                    type = DotTypes.NORMAL
                } else if (peopleInDot <= cellCount) {
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
