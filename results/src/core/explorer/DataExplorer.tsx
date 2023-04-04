import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import Grid from './Grid'
import { ExplorerData } from '@devographics/types'
import { addExtraCounts, getTotals } from './helpers'
import { Entity } from '@types/index'
import Heading from './Heading'
import { GRID_GAP } from './constants'
import sumBy from 'lodash/sumBy.js'
import Loading from './Loading'
import { useOptions } from 'core/helpers/options'

/*

xKeys: x-axis
yKeys: y-axis

*/

interface DataExplorerProps {
    data: ExplorerData
    stateStuff: any
    entities: Entity[]
}
const DataExplorer = (props: DataExplorerProps) => {
    const { data, stateStuff } = props

    const { items } = data
    const { isLoading, currentYear, xField, yField } = stateStuff

    // const allYears = all_years.map((y) => y.year);
    const currentYearData = items?.find(i => i?.year === currentYear)
    if (!currentYearData) {
        return <div>No data for year {currentYear}.</div>
    }
    // const facets = addExtraCounts(currentYearData.facets)
    const buckets = currentYearData.buckets

    const yKeys = buckets.map(b => b.id)
    const xKeys = buckets[0].facetBuckets.map(b => b.id)

    const totalCount = sumBy(buckets, bucket => sumBy(bucket.facetBuckets, b => b.count))

    const xTotals = getTotals({ buckets, axis: 'x', keys: xKeys || [], totalCount })
    const yTotals = getTotals({ buckets, axis: 'y', keys: yKeys || [], totalCount })

    const commonProps = {
        ...props,
        buckets,
        xKeys,
        yKeys,
        xTotals,
        yTotals,
        totalCount
    }
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
