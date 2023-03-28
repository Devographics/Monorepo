import React, { useState, useEffect, useRef } from 'react'
import { useFilterLegends, fetchSeriesData, doNothing } from './helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_STACKED } from './constants'
import { useAllChartsOptions } from 'core/charts/hooks'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import SingleWrapper from './SingleWrapper'

const FacetDataLoader = ({ block, children, chartFilters }: DynamicDataLoaderProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { year } = currentEdition

    const { options = {} } = chartFilters
    const { showDefaultSeries = true } = options

    useEffect(() => {
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
