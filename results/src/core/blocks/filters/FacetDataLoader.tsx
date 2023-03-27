import React, { useState, useEffect, useRef } from 'react'
import { useFilterLegends } from './helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_STACKED } from './constants'
import { useAllChartsOptions } from 'core/charts/hooks'
import {
    doNothing,
    DynamicDataLoaderProps,
    fetchSeriesData,
    SingleWrapper
} from './DynamicDataLoader'

const FacetDataLoader = ({
    block,
    data,
    getChartData = doNothing,
    processBlockDataOptions = {},
    setUnits,
    completion,
    children,
    chartFilters,
    setBuckets,
    combineSeries,
    layout = 'column'
}: DynamicDataLoaderProps) => {
    const theme = useTheme()
    const { getString } = useI18n()

    const defaultBuckets = getChartData(data, processBlockDataOptions)
    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = { name: 'default', buckets: defaultBuckets }

    // combined behavior: single series with a combined bucket
    const [combinedBuckets, setCombinedBuckets] = useState(defaultBuckets)
    // keep track of how many series are displayed within the combined bucket
    const [seriesCount, setSeriesCount] = useState(1)

    // multiple behavior: multiple series with normal buckets
    const [series, setSeries] = useState([defaultSeries])

    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { year } = currentEdition

    const { options = {} } = chartFilters
    const { showDefaultSeries = true, mode } = options

    const legends = useFilterLegends({
        chartFilters
    })

    const initialLoad = useRef(true)

    const useAllFilters = useAllChartsOptions()

    useEffect(() => {
        if (initialLoad.current && !chartFilters.options.queryOnLoad) {
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)

            const { seriesNames, seriesBlockData } = await fetchSeriesData({
                block,
                pageContext,
                chartFilters,
                year
            })

            console.log(seriesNames)
            console.log(seriesBlockData)
            // const dataPath = getBlockDataPath({ block, pageContext, addRootNode: false })

            // apply dataPath to get block data for each series
            // const blockData = get(result, dataPath)
            // const facets = blockData?.facets

            // const invertedFacetsBuckets = invertFacets({
            //     facets,
            //     defaultBuckets
            // })
            // const invertedFacetsBucketsWithAverages = calculateAverages({
            //     buckets: invertedFacetsBuckets,
            //     useAllFilters,
            //     facet: chartFilters.facet
            // })
            // setUnits('percentage_bucket')
            // setCombinedBuckets(invertedFacetsBucketsWithAverages)
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0 || !isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    return (
        <SingleWrapper
            buckets={combinedBuckets}
            seriesCount={seriesCount}
            chartDisplayMode={CHART_MODE_STACKED}
            facet={chartFilters.facet}
            isLoading={isLoading}
            showDefaultSeries={showDefaultSeries}
        >
            {children}
        </SingleWrapper>
    )
}

export default FacetDataLoader
