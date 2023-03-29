import React, { useState, useEffect } from 'react'
import { useFilterLegends } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import WrapperGrid from './WrapperGrid'
import { fetchSeriesData } from '../helpers'
import { DataSeries } from 'core/blocks/filters/types'

interface GridDataLoaderProps extends DynamicDataLoaderProps {
    defaultSeries: DataSeries
}

/*

Display multiple series as multiple side-by-side "small multiples" charts

*/
const GridDataLoader = ({
    block,
    defaultSeries,
    children,
    chartFilters,
    layout = 'column'
}: GridDataLoaderProps) => {
    const pageContext = usePageContext()
    const year = pageContext.currentEdition.year
    const showDefaultSeries = chartFilters.options.showDefaultSeries

    const legends = useFilterLegends({
        chartFilters
    })

    const [isLoading, setIsLoading] = useState(false)
    const [series, setSeries] = useState([defaultSeries])

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true)

            const seriesData = await fetchSeriesData({
                block,
                pageContext,
                chartFilters,
                year
            })

            const allSeries = showDefaultSeries ? [defaultSeries, ...seriesData] : seriesData

            console.log(seriesData)
            setSeries(allSeries)
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0) {
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
