import React from 'react'
import styled from 'styled-components'
import Loading from 'core/blocks/explorer/Loading'
import { FacetItem } from './types'
// import { spacing, mq, fontSize } from 'core/theme'

type SingleWrapperProps = {
    data?: any
    seriesCount?: number
    chartDisplayMode: any
    facet?: FacetItem
    isLoading: boolean
    showDefaultSeries?: boolean
    children: React.ReactNode
}

export const SingleWrapper = ({
    data,
    seriesCount,
    chartDisplayMode,
    facet,
    isLoading,
    showDefaultSeries,
    children
}: SingleWrapperProps) => (
    <Wrapper_>
        <Contents_>
            {React.cloneElement(children, {
                data,
                seriesCount,
                chartDisplayMode,
                facet,
                showDefaultSeries
            })}
        </Contents_>
        {isLoading && <Loading />}
    </Wrapper_>
)

const Wrapper_ = styled.div`
    position: relative;
`

const Contents_ = styled.div`
    flex: 1;
`

export default SingleWrapper
