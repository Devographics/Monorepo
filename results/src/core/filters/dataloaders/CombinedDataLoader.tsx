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

interface CombinedDataLoaderProps extends DynamicDataLoaderProps {
    defaultSeries: DataSeries<AllQuestionData>
}

const CombinedDataLoader = ({
    block,
    providedSeries,
    defaultSeries,
    setUnits,
    chartFilters,
    setChartFilters,
    children
}: CombinedDataLoaderProps) => {
    const pageContext = usePageContext()
    const year = pageContext.currentEdition.year

    const showDefaultSeries = chartFilters.options.showDefaultSeries

    const [isLoading, setIsLoading] = useState(false)
    const [series, setSeries] = useState(providedSeries || [defaultSeries])

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true)

            const seriesData = await fetchSeriesData({
                block,
                pageContext,
                chartFilters,
                year
            })

            // percentageQuestion is the only unit that lets us
            // meaningfully compare values across series
            if (setUnits) {
                setUnits(BucketUnits.PERCENTAGE_QUESTION)
            }
            const combinedSeries = showDefaultSeries ? [defaultSeries, ...seriesData] : seriesData
            setSeries(combinedSeries)
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
              showDefaultSeries
          }

    return (
        <Wrapper_>
            <Contents_>{React.cloneElement(children, props)}</Contents_>
            {isLoading && <Loading />}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div`
    position: relative;
`

const Contents_ = styled.div`
    flex: 1;
`

export default CombinedDataLoader
