import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Dots from './Dots'
import Grid from './Grid'
import Axis from './Axis'
import Stats from './Stats'
import { ExplorerData } from './types'
import { addExtraCounts } from './helpers'

/*

keys1: x-axis
keys2: y-axis

*/
const DataExplorer = ({ data }: { data: ExplorerData }) => {
    const { keys1, keys2, all_years } = data
    let facets = all_years[1].facets
    facets = addExtraCounts(facets)
    return (
        <Wrapper>
            <Axis type="x" keys={keys1} />
            <Axis type="y" keys={keys2} />
            <Dots facets={facets} keys1={keys1} keys2={keys2} />
            <Grid facets={facets} keys1={keys1} keys2={keys2} />
            <Stats facets={facets} />
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
