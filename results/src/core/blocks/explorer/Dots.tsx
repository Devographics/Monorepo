import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
// import Dot from './Dot'
import sumBy from 'lodash/sumBy'
import { ExplorerDataBucket, ExplorerDataFacet, Dot } from './types'
import {
    TOTAL_DOTS,
    PEOPLE_PER_DOTS,
    INCREMENT,
    GAP,
    MAX_DOT_PER_CELL_LINE,
    GRID_WIDTH
} from './constants'

/*

Get grid parameters

*/
const getParameters = ({ keys1, keys2 }) => {
    const columnCount = keys1.length
    const rowCount = keys2.length
    const cellWidth = Math.floor((GRID_WIDTH - (columnCount - 1) * GAP) / columnCount)
    const maxDotsPerLine = Math.floor(cellWidth / INCREMENT)
    const columnWidth = maxDotsPerLine * INCREMENT
    const rowHeight = 100
    return { gap: GAP, columnCount, rowCount, cellWidth, maxDotsPerLine, columnWidth, rowHeight }
}

/*

Get a dot's coordinates in pixel

Note: take into account 1-space gap in between each cell

*/
const getPixelCoordinates = ({ keys1, keys2, rowIndex, columnIndex, dotIndex }) => {
    const { maxDotsPerLine, columnWidth, rowHeight } = getParameters({ keys1, keys2 })

    const x = columnIndex * (columnWidth + GAP) + (dotIndex % maxDotsPerLine) * INCREMENT
    const y = rowIndex * (rowHeight + GAP) + Math.floor(dotIndex/maxDotsPerLine) * INCREMENT
    // const x = columnIndex
    // const y = rowIndex
    return { x, y }
}

// get data attr for debugging
const getDataAttr = (o: any) => {
    const attr: any = {}
    Object.keys(o).forEach(k => {
        attr[`data-${k}`] = o[k]
    })
    return attr
}

// const getValues = ({facets, keys1, keys2}) => {

//   const totalRespondents = sumBy(facets, f => f.completion.count)
//   const cutoffCount = totalRespondents/PEOPLE_PER_DOTS
// }

const addExtraCounts = (facets: ExplorerDataFacet[]) => {
    let facetRunningCount = 0,
        bucketRunningCount = 0
    facets.forEach((f: ExplorerDataFacet, i: number) => {
        f.fromCount = facetRunningCount
        facetRunningCount += f.completion.count
        f.toCount = facetRunningCount - 1
        f.rowIndex = i
        f.buckets.forEach((b: ExplorerDataBucket, j: number) => {
            b.fromCount = bucketRunningCount
            bucketRunningCount += b.count
            b.toCount = bucketRunningCount - 1
            b.columnIndex = j
        })
    })
}

const isBetween = (i: number, lowerBound = 0, upperBound = 0) => {
    return lowerBound <= i && i <= upperBound
}

// get all dots
const getDots = ({ facets, keys1, keys2 }: { facets: ExplorerDataFacet[] }): Dot[] => {
    const totalRespondents = sumBy(facets, f => f.completion.count)

    const dots = [...Array(TOTAL_DOTS)].map((x, i: number) => {
        const peopleCount = i * PEOPLE_PER_DOTS
        if (peopleCount < totalRespondents) {
            // find facet containing current dot
            const facet = facets.find((f: ExplorerDataFacet) =>
                isBetween(peopleCount, f.fromCount, f.toCount)
            )
            if (!facet) {
                throw new Error(`No valid facet found for dot ${peopleCount}`)
            }

            // find bucket containing current dot
            const bucket = facet.buckets.find((b: ExplorerDataBucket) =>
                isBetween(peopleCount, b.fromCount, b.toCount)
            )
            if (!bucket || typeof bucket.fromCount === 'undefined') {
                throw new Error(`No valid bucket found for dot ${peopleCount}`)
            }

            const { rowIndex } = facet
            const { columnIndex } = bucket
            const dotIndex = Math.floor((peopleCount - bucket.fromCount)/INCREMENT)
            const { x, y } = getPixelCoordinates({ keys1, keys2, rowIndex, columnIndex, dotIndex })
            return { i: peopleCount, visible: true, x, y, rowIndex, columnIndex, dotIndex }
        } else {
            return { i: peopleCount, visible: false, x: 0, y: 0 }
        }
    })
    return dots
}

const Dots = ({ facets, keys1, keys2 }) => {
    addExtraCounts(facets)
    console.log(facets)
    const dots = getDots({ facets, keys1, keys2 })
    console.log(dots)
    console.log(getParameters({ keys1, keys2 }))
    return (
        <Dots_>
            {dots.map((dot, i) => (
                <Dot_ key={i} style={{ left: `${dot.x}px`, top: `${dot.y}px` }} />
            ))}
        </Dots_>
    )
}

const Dots_ = styled.div``

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
`

export default Dots
