import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import sumBy from 'lodash/sumBy'
import { ExplorerDataFacet } from './types'

const Stats = ({ facets }: {facets: ExplorerDataFacet[]}) => {
    const totalCount = sumBy(facets, f => sumBy(f.buckets, b => b.count))
    return <Stats_>total: {totalCount} respondents</Stats_>
}

const Stats_ = styled.div``

export default Stats
