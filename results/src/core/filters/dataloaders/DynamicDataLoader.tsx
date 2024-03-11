import React, { ReactNode, Dispatch, SetStateAction, useState } from 'react'
import { MODE_FACET, MODE_COMBINED, MODE_GRID, CHART_MODE_DEFAULT } from '../constants'
import { CustomizationDefinition, DataSeries } from '../types'
import { BlockDefinition } from 'core/types/index'
import { BucketUnits, AllQuestionData, Bucket } from '@devographics/types'
import GridDataLoader from './GridDataLoader'
import CombinedDataLoader from './CombinedDataLoader'
import FacetDataLoader from './FacetDataLoader'
import { DataLoaderFooter } from './DataLoaderFooter'
import { DataLoaderError } from './DataLoaderError'
import styled from 'styled-components'
import Loading from 'core/explorer/Loading'
import { FilterLegend, useChartFilters } from '../helpers'
import BlockLegends from 'core/blocks/block/BlockLegends'

export type ApiError = any

export interface DynamicDataLoaderWrapperProps<T> {
    defaultSeries: DataSeries<T>
    block: BlockDefinition
    units: BucketUnits
    setUnits: Dispatch<SetStateAction<BucketUnits>>
    children: ReactNode
    chartFilters: CustomizationDefinition
    setChartFilters: Dispatch<SetStateAction<CustomizationDefinition>>
    layout?: 'grid' | 'column'
    providedSeries?: DataSeries<T>[]
    getChartData: (data: T, block: BlockDefinition) => Bucket[]
    getChartDataOptions?: any
}

export interface DynamicDataLoaderProps<T> extends DynamicDataLoaderWrapperProps<T> {
    apiError: ApiError
    setApiError: Dispatch<SetStateAction<ApiError>>
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
    query: string | undefined
    setQuery: Dispatch<SetStateAction<string | undefined>>
    series: Array<DataSeries<T>>
    setSeries: Dispatch<SetStateAction<Array<DataSeries<T>>>>
    filterLegends: FilterLegend[]
}

function DynamicDataLoader<T>(props: DynamicDataLoaderProps<T>) {
    const { chartFilters, children } = props
    const { options = {} } = chartFilters
    const { mode } = options

    switch (mode) {
        case MODE_GRID:
            return <GridDataLoader<T> {...props} />

        case MODE_COMBINED:
            return <CombinedDataLoader<T> {...props} />

        case MODE_FACET:
            return <FacetDataLoader<T> {...props} />

        default:
            return React.cloneElement(children, {
                chartDisplayMode: CHART_MODE_DEFAULT
            })
    }
}

function DataLoaderWrapper<T>(props: DynamicDataLoaderWrapperProps<T>) {
    const {
        providedSeries,
        defaultSeries,
        block,
        chartFilters: providedFiltersState,
        units,
        getChartData,
        getChartDataOptions = {}
    } = props
    const [apiError, setApiError] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const [series, setSeries] = useState(providedSeries || [defaultSeries])
    const [query, setQuery] = useState<string | undefined>()

    // console.log(props)
    // console.log(series)
    const allBuckets = series
        .map(serie => getChartData(serie.data, block, getChartDataOptions))
        .flat()

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] },
        buckets: allBuckets,
        providedFiltersState
    })

    const loaderProps = {
        ...props,
        apiError,
        setApiError,
        isLoading,
        setIsLoading,
        query,
        setQuery,
        series,
        setSeries,
        filterLegends
    }

    const legendProps = {
        block,
        // data,
        units,
        position: 'top',
        legends: filterLegends,
        chartFilters,
        layout: 'vertical'
    }

    const showLegends =
        filterLegends.length > 0 &&
        [MODE_FACET, MODE_COMBINED].includes(String(providedFiltersState.options.mode)) &&
        [
            BucketUnits.COUNT,
            BucketUnits.PERCENTAGE_SURVEY,
            BucketUnits.PERCENTAGE_QUESTION,
            BucketUnits.PERCENTAGE_BUCKET
        ].includes(units)

    return (
        <Wrapper_>
            {showLegends && <BlockLegends {...legendProps} />}
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
