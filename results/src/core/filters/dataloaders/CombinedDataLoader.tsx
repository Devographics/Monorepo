import React, { useState, useEffect } from 'react'
import { usePageContext } from 'core/helpers/pageContext'
import { CHART_MODE_GROUPED } from '../constants'
import { AllQuestionData, BucketUnits } from '@devographics/types'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import { DataLoaderFooter } from './DataLoaderFooter'
import { fetchSeriesData } from '../helpers'
import { DataSeries } from 'core/filters/types'
import styled from 'styled-components'
import Loading from 'core/explorer/Loading'
import { JSONTrigger } from 'core/blocks/block/BlockData'
import FiltersTrigger from '../FiltersTrigger'
// import { spacing, mq, fontSize } from 'core/theme'

interface CombinedDataLoaderProps<T> extends DynamicDataLoaderProps<T> {
    defaultSeries: DataSeries<T>
}

function CombinedDataLoader<T>({
    block,
    providedSeries,
    defaultSeries,
    setUnits,
    chartFilters,
    setChartFilters,
    setApiError,
    children,
    isLoading,
    setIsLoading,
    setQuery,
    series,
    setSeries,
    filterLegends
}: CombinedDataLoaderProps<T>) {
    const pageContext = usePageContext()
    const year = pageContext.currentEdition.year

    const showDefaultSeries = chartFilters.options.showDefaultSeries

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
                // percentageQuestion is the only unit that lets us
                // meaningfully compare values across series
                if (setUnits) {
                    setUnits(BucketUnits.PERCENTAGE_QUESTION)
                }
                const combinedSeries = showDefaultSeries
                    ? [defaultSeries, ...seriesData]
                    : seriesData
                setSeries(combinedSeries)
            }
            setIsLoading(false)
        }

        if (!chartFilters.options.preventQuery && chartFilters?.filters?.length > 0) {
            getData()
        }
    }, [chartFilters])

    const props = isLoading
        ? {}
        : {
              series,
              chartDisplayMode: CHART_MODE_GROUPED,
              filters: chartFilters.filters,
              showDefaultSeries,
              filterLegends
          }

    return (
        <Wrapper_>
            <Contents_>{React.cloneElement(children, props)}</Contents_>
        </Wrapper_>
    )
}

const Wrapper_ = styled.div``

const Contents_ = styled.div`
    flex: 1;
`

export default CombinedDataLoader
