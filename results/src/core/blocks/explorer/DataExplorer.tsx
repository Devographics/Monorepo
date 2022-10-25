import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Dots from './Dots'
import Grid from './Grid'
import Axis from './Axis'
import Selector from './Selector'
import Stats from './Stats'
import { ExplorerData } from './types'
import { addExtraCounts } from './helpers'

/*

keys1: x-axis
keys2: y-axis

*/
const DataExplorer = ({ data, stateStuff }: { data: ExplorerData; stateStuff: any }) => {
    const { keys1, keys2, all_years } = data
    let facets = all_years[1].facets
    facets = addExtraCounts(facets)
    return (
        <Wrapper>
            <GridWrapper_>
                <Dots facets={facets} keys1={keys1} keys2={keys2} />
                <Grid facets={facets} keys1={keys1} keys2={keys2} />
                <Axis axis="x" keys={keys1} />
                <Axis axis="y" keys={keys2} />
            </GridWrapper_>
            <Footer_>
                <Stats facets={facets} />
                <Selector axis="y" stateStuff={stateStuff} />
                <Selector axis="x" stateStuff={stateStuff} />
            </Footer_>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    position: relative;
    /* height: 760px; */
    /* width: 760px; */
    margin: 20px;
    /* @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    } */
`

const GridWrapper_ = styled.div`
    position: relative;
`
const Footer_ = styled.div`
    margin-top: 30px;
`

export default DataExplorer
