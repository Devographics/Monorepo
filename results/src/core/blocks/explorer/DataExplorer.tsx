import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Dots from './Dots'
import Grid from './Grid'
import Axis from './Axis'
import { ExplorerData } from './types'

const DataExplorer = ({ data }: { data: ExplorerData }) => {
    const { keys1, keys2, all_years } = data
    const facets = all_years[1].facets
    const xAxis = keys1
    const yAxis = keys2
    return (
        <Wrapper>
            <Axis type="x" keys={xAxis} />
            <Axis type="y" keys={yAxis} />
            <Grid xAxis={xAxis} yAxis={yAxis} />
            <Dots facets={facets} keys1={keys1} keys2={keys2} />
        </Wrapper>
    )
}

const Wrapper = styled.div`
    position: relative;
    height: 760px;
    width: 760px;
    margin: 20px;
    /* @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    } */
`

export default DataExplorer
