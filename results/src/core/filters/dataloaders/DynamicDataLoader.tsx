import React, { ReactNode, Dispatch, SetStateAction, useState } from 'react'
import { MODE_FACET, MODE_COMBINED, MODE_GRID, CHART_MODE_DEFAULT } from '../constants'
import { CustomizationDefinition, DataSeries } from '../types'
import { BlockDefinition } from 'core/types/index'
import { BucketUnits, AllQuestionData } from '@devographics/types'
import GridDataLoader from './GridDataLoader'
import CombinedDataLoader from './CombinedDataLoader'
import FacetDataLoader from './FacetDataLoader'
import { DataLoaderFooter } from './DataLoaderFooter'
import { DataLoaderError } from './DataLoaderError'
import styled from 'styled-components'
import Loading from 'core/explorer/Loading'

export type ApiError = any

export interface DynamicDataLoaderProps {
    defaultSeries: DataSeries<AllQuestionData>
    block: BlockDefinition
    units: BucketUnits
    setUnits: Dispatch<SetStateAction<BucketUnits>>
    children: ReactNode
    chartFilters: CustomizationDefinition
    setChartFilters: Dispatch<SetStateAction<CustomizationDefinition>>
    layout?: 'grid' | 'column'
    providedSeries?: DataSeries<AllQuestionData> | DataSeries<AllQuestionData>[]
    apiError: ApiError
    setApiError: Dispatch<SetStateAction<ApiError>>
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
    query: string | undefined
    setQuery: Dispatch<SetStateAction<string | undefined>>
}

const DynamicDataLoader = (props: DynamicDataLoaderProps) => {
    const { chartFilters, children } = props
    const { options = {} } = chartFilters
    const { mode } = options

    switch (mode) {
        case MODE_GRID:
            return <GridDataLoader {...props} />

        case MODE_COMBINED:
            return <CombinedDataLoader {...props} />

        case MODE_FACET:
            return <FacetDataLoader {...props} />

        default:
            return React.cloneElement(children, {
                chartDisplayMode: CHART_MODE_DEFAULT
            })
    }
}

const DataLoaderWrapper = (props: DynamicDataLoaderProps) => {
    const [apiError, setApiError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [query, setQuery] = useState<string | undefined>()
    const loaderProps = {
        ...props,
        apiError,
        setApiError,
        isLoading,
        setIsLoading,
        query,
        setQuery
    }
    return (
        <Wrapper_>
            <DynamicDataLoader {...loaderProps} />
            {apiError && <DataLoaderError {...loaderProps} />}
            <DataLoaderFooter {...loaderProps} />
            {isLoading && <Loading />}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div`
    position: relative;
`

export default DataLoaderWrapper
