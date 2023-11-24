import React, { useState, useEffect } from 'react'
import { fetchSeriesData } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_STACKED } from '../constants'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import { DataLoaderFooter } from './DataLoaderFooter'
import Loading from 'core/explorer/Loading'
import styled from 'styled-components'
import { DataSeries } from '../types'
import { JSONTrigger } from 'core/blocks/block/BlockData'
import { AllQuestionData, BucketUnits } from '@devographics/types'
import T from 'core/i18n/T'
import { Note_ } from 'core/blocks/block/BlockNote'
import { useAllFilters } from 'core/charts/hooks'

interface FacetDataLoaderProps<T> extends DynamicDataLoaderProps<T> {
    defaultSeries: DataSeries<T>
}

function FacetDataLoader<T>({
    defaultSeries,
    block,
    children,
    chartFilters,
    setChartFilters,
    units,
    setUnits,
    providedSeries,
    setApiError,
    setQuery,
    isLoading,
    setIsLoading,
    series,
    setSeries,
    filterLegends
}: FacetDataLoaderProps<T>) {
    const pageContext = usePageContext()
    const allFilters = useAllFilters(block.id)

    const year = pageContext.currentEdition.year
    const showDefaultSeries = chartFilters.options.showDefaultSeries

    // const [isLoading, setIsLoading] = useState(false)

    allFilters.find(o => o.id === chartFilters?.facet?.id)
    const facetQuestion = allFilters.find(o => o.id === chartFilters?.facet?.id)

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
                setSeries(seriesData)
                setUnits(
                    facetQuestion?.optionsAreRange
                        ? BucketUnits.PERCENTILES
                        : BucketUnits.PERCENTAGE_BUCKET
                )
            }
            setIsLoading(false)
        }

        if (!chartFilters.options.preventQuery && !isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    const props = isLoading
        ? {}
        : {
              series,
              chartDisplayMode: CHART_MODE_STACKED,
              facet: chartFilters.facet,
              showDefaultSeries,
              filterLegends
          }

    return (
        <Wrapper_>
            <Contents_>{React.cloneElement(children, props)}</Contents_>
            {units === BucketUnits.PERCENTAGE_BUCKET && (
                <Note_>
                    <T k="charts.facets_clarification" />
                </Note_>
            )}
            {units === BucketUnits.AVERAGE && (
                <Note_>
                    <T k="charts.average_clarification" />
                </Note_>
            )}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div``

const Contents_ = styled.div`
    flex: 1;
`

export default FacetDataLoader
