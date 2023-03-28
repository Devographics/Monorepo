import React, { useState, useEffect, useRef } from 'react'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_GROUPED } from './constants'
import { BucketUnits } from '@devographics/types'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import SingleWrapper from './SingleWrapper'
import { fetchSeriesData } from './helpers'

const CombinedDataLoader = ({
    block,
    getChartData,
    data,
    setUnits,
    chartFilters,
    children
}: DynamicDataLoaderProps) => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { year } = currentEdition
    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = data[0]

    // combined behavior: single series with a combined bucket
    const [combinedSeries, setCombinedSeries] = useState([defaultSeries])
    // keep track of how many series are displayed within the combined bucket
    const [seriesCount, setSeriesCount] = useState(1)

    useEffect(() => {
        console.log('// useEffect')

        const getData = async () => {
            setIsLoading(true)

            const seriesData = await fetchSeriesData({
                block,
                pageContext,
                chartFilters,
                year
            })
            console.log('// CombinedDataLoader')
            console.log(seriesData)

            // percentageQuestion is the only unit that lets us
            // meaningfully compare values across series
            if (setUnits) {
                setUnits(BucketUnits.PERCENTAGE_QUESTION)
            }
            defaultSeries.name = 'default'
            const combinedSeries = chartFilters.options.showDefaultSeries
                ? [defaultSeries, ...seriesData]
                : seriesData
            setSeriesCount(combinedSeries.length)
            setCombinedSeries(combinedSeries)
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0 || !isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    return (
        <SingleWrapper
            data={combinedSeries}
            seriesCount={seriesCount}
            chartDisplayMode={CHART_MODE_GROUPED}
            isLoading={isLoading}
            showDefaultSeries={chartFilters.options.showDefaultSeries}
        >
            {children}
        </SingleWrapper>
    )
}

export default CombinedDataLoader
