import React, { useState, useEffect, useRef } from 'react'
import { useFilterLegends } from './helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import WrapperGrid from './WrapperGrid'
import { doNothing, fetchSeriesData } from './helpers'

/*

Display multiple series as multiple side-by-side "small multiples" charts

*/
const GridDataLoader = ({
    block,
    data,
    getChartData = doNothing,
    processBlockDataOptions = {},
    children,
    chartFilters,
    layout = 'column'
}: DynamicDataLoaderProps) => {
    const defaultBuckets = getChartData(data, processBlockDataOptions)
    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = { name: 'default', buckets: defaultBuckets }

    // multiple behavior: multiple series with normal buckets
    const [series, setSeries] = useState([defaultSeries])

    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    const { year } = currentEdition

    const { options = {} } = chartFilters
    const { showDefaultSeries = true } = options

    const legends = useFilterLegends({
        chartFilters
    })

    useEffect(() => {
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

            const allSeries = [
                ...(showDefaultSeries ? [defaultSeries] : []),
                ...seriesNames.map((name, i) => ({
                    name,
                    ...seriesBlockData[i]
                }))
            ]
            console.log(allSeries)
            setSeries(allSeries)
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0 || !isEmpty(chartFilters.facet)) {
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
