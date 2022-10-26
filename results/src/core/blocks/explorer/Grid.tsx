import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import { ExplorerDataFacet, Key } from './types'

const Grid = ({
    facets,
    keys1,
    keys2
}: {
    facets: ExplorerDataFacet[]
    keys1: Key[]
    keys2: Key[]
}) => {
    return (
        <Grid_>
            {keys2.map((f, i) => (
                <Row key={i} yIndex={i} facets={facets} keys1={keys1} keys2={keys2} />
            ))}
        </Grid_>
    )
}

const Row = ({
    facets,
    keys1,
    keys2,
    yIndex
}: {
    facets: ExplorerDataFacet[]
    keys1: Key[]
    keys2: Key[]
    yIndex: number
}) => {
    const facet = facets[yIndex]
    return (
        <Row_>
            {keys1.map((b, i) => (
                <Cell key={i} facet={facet} yIndex={yIndex} xIndex={i} />
            ))}
        </Row_>
    )
}

const Cell = ({
    facet,
    xIndex,
    yIndex
}: {
    facet: ExplorerDataFacet
    xIndex: number
    yIndex: number
}) => {
    const bucket = facet?.buckets[xIndex]
    return (
        <Cell_>
            <div>
                ({xIndex}, {yIndex})
            </div>
            <div>{facet.id}</div>
            <div>{bucket.id}</div>
            <div>{bucket.count}</div>
        </Cell_>
    )
}
const Grid_ = styled.div`
    display: grid;
    grid-auto-rows: minmax(0, 1fr);
    grid-auto-flow: row;
    gap: 10px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`
const Row_ = styled.div`
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    gap: 10px;
`

const Cell_ = styled.div`
    background: rgba(255, 255, 255, 0.1);
    height: 100%;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.2);
    font-size: 10px;
    z-index: 10;
    &:hover {
        background: rgba(0, 0, 0, 0.9);
        color: rgba(255, 255, 255, 0.9);
    }
`

export default Grid
