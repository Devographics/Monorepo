import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'

const Grid = ({ xAxis, yAxis }) => {
    return (
        <Grid_>
            {yAxis.map((f, i) => (
                <Row key={i} xAxis={xAxis} />
            ))}
        </Grid_>
    )
}

const Row = ({ xAxis }) => {
    return (
        <Row_>
            {xAxis.map((b, i) => (
                <Cell_ key={i}  />
            ))}
        </Row_>
    )
}

const Grid_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`
const Row_ = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    height: 100px;
`

const Cell_ = styled.div`
    background: rgba(255, 255, 255, 0.1);
    height: 100%;
`

export default Grid
