import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Grid from './Grid'
import { ExplorerDataFormatted } from './types'
import { addExtraCounts, getTotals } from './helpers'
import { Entity } from '@types/index'
import Heading from './Heading'
import { GRID_GAP } from './constants'
import sumBy from 'lodash/sumBy.js'
import Loading from './Loading'

/*

keys1: x-axis
keys2: y-axis

*/

interface DataExplorerProps {
    data: ExplorerDataFormatted
    stateStuff: any
    entities: Entity[]
}
const DataExplorer = (props: DataExplorerProps) => {
    const { data, stateStuff } = props

    const { keys1, keys2, all_years } = data
    const { isLoading, currentYear } = stateStuff

    // const allYears = all_years.map((y) => y.year);
    const currentYearData = all_years?.find(y => y?.year === currentYear)
    if (!currentYearData) {
        return <div>No data for year {currentYear}.</div>
    }
    const facets = addExtraCounts(currentYearData.facets)
    const xTotals = getTotals({ facets, axis: 'x', keys: keys1 })
    const yTotals = getTotals({ facets, axis: 'y', keys: keys2 })
    const totalCount = sumBy(facets, f => sumBy(f.buckets, b => b.count))

    const commonProps = { ...props, facets, keys1, keys2, xTotals, yTotals, totalCount }
    return (
        <Wrapper>
            <Heading {...commonProps} />
            <GridWrapper_>
                <Grid {...commonProps} />
                {isLoading && <Loading />}
            </GridWrapper_>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    position: relative;
`

const GridWrapper_ = styled.div`
    position: relative;

    @media ${mq.small} {
        overflow-x: scroll;
    }
`

export default DataExplorer
