import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Dot from './Dot'
import { getAllDots, getDataAttr, getParameters } from './helpers'
import { ExplorerDataFacet, Key } from './types'

/*

Figure out how many column/rows should go in a cell based on max bucket count

*/
export const getCellColumnRowCounts = (maxBucketCount: number) => {
    let cellColumnCount = 10
    if (maxBucketCount > 2000) {
        cellColumnCount = 15
    }
    if (maxBucketCount > 3000) {
        cellColumnCount = 20
    }
    if (maxBucketCount > 4000) {
        cellColumnCount = 25
    }
    if (maxBucketCount > 5000) {
        cellColumnCount = 30
    }
    const cellRowCount = Math.ceil(maxBucketCount / (cellColumnCount * 10))
    return { cellColumnCount, cellRowCount }
}

/*

Get a dot's coordinates in pixel

Note: take into account 1-space gap in between each cell

*/
export const getPixelCoordinates = ({
    facets,
    xKeys,
    yKeys,
    rowIndex,
    columnIndex,
    dotIndex
}: {
    facets: ExplorerDataFacet[]
    xKeys: Key[]
    yKeys: Key[]
    rowIndex: number
    columnIndex: number
    dotIndex: number
}) => {
    const { cellColumnCount, cellRowCount } = getParameters({
        facets,
        xKeys,
        yKeys
    })

    const x = columnIndex * cellColumnCount + (dotIndex % cellColumnCount)
    const y = rowIndex * cellRowCount + Math.floor(dotIndex / cellColumnCount)
    // const xAbs = columnIndex * (columnWidth + GAP) + (dotIndex % maxDotsPerLine) * INCREMENT
    // const yAbs = rowIndex * (rowHeight + GAP) + Math.floor(dotIndex / maxDotsPerLine) * INCREMENT
    return { x, y }
}

// get data attr for debugging
export const getDataAttr = (o: any) => {
    const attr: any = {}
    Object.keys(o).forEach(k => {
        attr[`data-${k}`] = o[k]
    })
    return attr
}
/*

Get all the dots for the entire grid as one array

*/
export const getAllDots = ({
    facets,
    xKeys,
    yKeys,
    respondentsPerDot
}: {
    facets: ExplorerDataFacet[]
    xKeys: Key[]
    yKeys: Key[]
    respondentsPerDot: number
}): DotType[] => {
    const totalRespondents = sumBy(facets, f => f.completion.count)

    const dots = [...Array(TOTAL_DOTS)].map((x, i: number) => {
        const peopleCount = i * respondentsPerDot
        if (peopleCount < totalRespondents) {
            // find facet containing current dot
            const facet = facets.find((f: ExplorerDataFacet) =>
                isBetween(peopleCount, f.fromCount, f.toCount)
            )
            if (!facet || typeof facet.rowIndex === 'undefined') {
                throw new Error(`No valid facet found for dot ${peopleCount}`)
            }

            // find bucket containing current dot
            const bucket = facet.buckets.find((b: ExplorerDataBucket) =>
                isBetween(peopleCount, b.fromCount, b.toCount)
            )
            if (
                !bucket ||
                typeof bucket.columnIndex === 'undefined' ||
                typeof bucket.fromCount === 'undefined'
            ) {
                throw new Error(`No valid bucket found for dot ${peopleCount}`)
            }

            const { rowIndex } = facet
            const { columnIndex } = bucket
            const dotIndex = Math.floor((peopleCount - bucket.fromCount) / INCREMENT)
            const { x, y } = getPixelCoordinates({
                facets,
                xKeys,
                yKeys,
                rowIndex,
                columnIndex,
                dotIndex
            })
            return { i, visible: true, x, y, rowIndex, columnIndex, dotIndex }
        } else {
            return { i, visible: false, x: 0, y: 0 }
        }
    })
    return dots
}

export const getDotStyle = (dot: DotType, params) => {
    const { x, y, visible } = dot
    const { columnCount, rowCount, cellColumnCount, cellRowCount } = params
    // x
    const gapCountX = columnCount - 1
    const cellWidth = `((100% - ${gapCountX * GAP}px)/${columnCount})`
    const incrementX = `(${cellWidth}/${cellColumnCount})`
    const numberOfXGaps = Math.floor(x / cellColumnCount)
    const left = `calc(${x} * ${incrementX} + ${GAP * numberOfXGaps}px)`

    // y
    const gapCountY = rowCount - 1
    const cellHeight = `((100% - ${gapCountY * GAP}px)/${rowCount})`
    const incrementY = `(${cellHeight}/${cellRowCount})`
    const numberOfYGaps = Math.floor(y / cellRowCount)
    const top = `calc(${y} * ${incrementY} + ${GAP * numberOfYGaps}px)`
    const opacity = visible ? 0.8 : 0
    return { left, top, opacity }
}

interface DotsProps {
    facets: ExplorerDataFacet[]
    xKeys: Key[]
    yKeys: Key[]
}

const Dots = ({ facets, xKeys, yKeys }: DotsProps) => {
    const dots = getAllDots({ facets, xKeys, yKeys })
    const params = getParameters({ facets, xKeys, yKeys })
    return (
        <Dots_>
            {dots.map((dot, i) => (
                <Dot_ {...getDataAttr(dot)} key={i} style={getDotStyle(dot, params)} />
            ))}
        </Dots_>
    )
}

const Dots_ = styled.div`
    position: absolute;
    left: 0px;
    top: 0px;
    bottom: 0px;
    right: 0px;
`

const Dot_ = styled.div`
    border-radius: 100%;
    background: rgba(255, 255, 255, 0.5);
    color: white;
    color: rgba(255, 255, 255, 0);
    height: 6px;
    width: 6px;
    margin-right: 2px;
    margin-bottom: 2px;
    position: absolute;
    z-index: 5;
    transition: all 700ms ease-in;
`

export default Dots
