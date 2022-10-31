import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Dots from './Dots'
import Grid from './Grid'
import Axis from './Axis'
import Selector from './Selector'
import YearSelector from './YearSelector'
import Stats from './Stats'
import Totals from './Totals'
import UnitsSelector from './UnitsSelector'
import { ExplorerData } from './types'
import { addExtraCounts, getTotals } from './helpers'

/*

keys1: x-axis
keys2: y-axis

*/
const DataExplorer = ({ data, stateStuff }: { data: ExplorerData; stateStuff: any }) => {
    const { keys1, keys2, all_years } = data
    const { isLoading, currentYear } = stateStuff
    const allYears = all_years.map(y => y.year)
    const currentYearData = all_years.find(y => y.year === currentYear)
    if (!currentYearData) {
        return <div>No data for year {currentYear}.</div>
    }
    const facets = addExtraCounts(currentYearData.facets)
    const totals1 = getTotals({ facets, axis: 'x', keys: keys1 })
    const totals2 = getTotals({ facets, axis: 'y', keys: keys2 })
    const commonProps = { facets, keys1, keys2, totals1, totals2, stateStuff }
    return (
        <Wrapper>
            <GridWrapper_>
                <Dots {...commonProps} />
                <Grid {...commonProps} />
                <Axis axis="x" keys={keys1} />
                <Axis axis="y" keys={keys2} />
                <Totals axis="x" totals={totals1} />
                <Totals axis="y" totals={totals2} />
                {isLoading && <Loading_>loading…</Loading_>}
            </GridWrapper_>
            <Footer_>
                <Stats facets={facets} />
                <YearSelector allYears={allYears} stateStuff={stateStuff} />
                <Selector axis="y" stateStuff={stateStuff} />
                <Selector axis="x" stateStuff={stateStuff} />
                <UnitsSelector {...commonProps} />
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
    height: 700px;
`
const Footer_ = styled.div`
    margin-top: 60px;
`
const Loading_ = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    z-index: 20;
`

export default DataExplorer
