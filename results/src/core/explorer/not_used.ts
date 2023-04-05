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
            const bucket = facet.buckets.find(b => isBetween(peopleCount, b.fromCount, b.toCount))
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
