import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { CommonProps } from './types'
import Cell from './Cell'
import { GRID_GAP } from './constants'
import { GridProps } from './Grid'

const InnerGrid = (props: CommonProps) => {
    const { yKeys } = props
    return (
        <Grid_>
            {yKeys.map((f, i) => (
                <Row key={i} yIndex={i} {...props} />
            ))}
        </Grid_>
    )
}

export interface RowProps extends GridProps {
    yIndex: number
}

const Row = (props: RowProps) => {
    const { buckets, xKeys, yIndex } = props
    const bucket = buckets[yIndex]
    return (
        <Row_>
            {xKeys.map((b, i) => (
                <Cell
                    key={i}
                    {...props}
                    facetBucket={bucket.facetBuckets[i]}
                    yIndex={yIndex}
                    xIndex={i}
                />
            ))}
        </Row_>
    )
}

const Grid_ = styled.div`
    grid-area: content;
    display: grid;
    grid-auto-rows: minmax(0, 1fr);
    grid-auto-rows: minmax(100px, min-content);
    grid-auto-flow: row;
    gap: ${GRID_GAP}px;
    /* position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0; */
`
const Row_ = styled.div`
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    gap: ${GRID_GAP}px;
`

export default InnerGrid
