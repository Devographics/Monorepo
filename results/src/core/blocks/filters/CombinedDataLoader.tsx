import React, { useState, useEffect, useRef } from 'react'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_GROUPED } from './constants'
import { BucketUnits } from '@devographics/types'
import { DynamicDataLoaderProps, fetchSeriesData, SingleWrapper } from './DynamicDataLoader'

const CombinedDataLoader = ({
    block,
    getChartData,
    data,
    setUnits,
    chartFilters,
    combineSeries,
    children
}: DynamicDataLoaderProps) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { year } = currentEdition
    const defaultBuckets = getChartData(data)
    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = { name: 'default', buckets: defaultBuckets }

    // combined behavior: single series with a combined bucket
    const [combinedBuckets, setCombinedBuckets] = useState(defaultBuckets)
    // keep track of how many series are displayed within the combined bucket
    const [seriesCount, setSeriesCount] = useState(1)

    const initialLoad = useRef(true)

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
            console.log('// DynamicDataLoader')
            console.log(seriesBlockData)
            // console.log(seriesChartData)

            // percentageQuestion is the only unit that lets us
            // meaningfully compare values across series
            if (setUnits) {
                setUnits(BucketUnits.PERCENTAGE_QUESTION)
            }
            const newCombinedBuckets = combineSeries(defaultBuckets, seriesBlockData)
            setCombinedBuckets(newCombinedBuckets)
            setSeriesCount(seriesBlockData.length)

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
            chartDisplayMode={CHART_MODE_GROUPED}
            facet={chartFilters.facet}
            isLoading={isLoading}
            showDefaultSeries={showDefaultSeries}
        >
            {children}
        </SingleWrapper>
    )
}

export default CombinedDataLoader
