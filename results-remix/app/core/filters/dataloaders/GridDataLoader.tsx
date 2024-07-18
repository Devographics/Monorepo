import React, { useState, useEffect } from 'react'
import { useFilterLegends } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import { DataLoaderFooter } from './DataLoaderFooter'
import WrapperGrid from './WrapperGrid'
import { fetchSeriesData } from '../helpers'
import { DataSeries } from 'core/filters/types'
import { JSONTrigger } from 'core/blocks/block/BlockData'

interface GridDataLoaderProps<T> extends DynamicDataLoaderProps<T> {
    defaultSeries: DataSeries<T>
}

/*

Display multiple series as multiple side-by-side "small multiples" charts

*/
function GridDataLoader<T>({
    block,
    defaultSeries,
    children,
    chartFilters,
    setChartFilters,
    layout = 'column',
    providedSeries,
    setApiError,
    isLoading,
    setIsLoading,
    setQuery,
    series,
    setSeries
}: GridDataLoaderProps<T>) {
    const pageContext = usePageContext()
    const year = pageContext.currentEdition.year
    const showDefaultSeries = chartFilters.options.showDefaultSeries

    const legends = useFilterLegends({
        chartFilters,
        block
    })

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true)

            const {
                result: seriesData,
                error,
                query
            } = await fetchSeriesData({
                block,
                pageContext,
                chartFilters,
                year
            })
            setQuery(query)

            if (error) {
                setApiError(error)
            } else if (seriesData) {
                const allSeries = showDefaultSeries ? [defaultSeries, ...seriesData] : seriesData

                setSeries(allSeries)
            }
            setIsLoading(false)
        }

        if (!chartFilters.options.preventQuery && chartFilters?.filters?.length > 0) {
            getData()
        }
    }, [chartFilters])

    return (
        <WrapperGrid
            layout={layout}
            series={series}
            legends={legends}
            isLoading={isLoading}
            showDefaultSeries={showDefaultSeries}
        >
            {children}
        </WrapperGrid>
    )
}

export default GridDataLoader
