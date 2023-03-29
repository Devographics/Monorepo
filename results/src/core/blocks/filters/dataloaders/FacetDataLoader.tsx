import React, { useState, useEffect } from 'react'
import { fetchSeriesData } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_STACKED } from '../constants'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import Loading from 'core/blocks/explorer/Loading'
import styled from 'styled-components'
import { DataSeries } from '../types'

interface FacetDataLoaderProps extends DynamicDataLoaderProps {
    defaultSeries: DataSeries
}

const FacetDataLoader = ({
    defaultSeries,
    block,
    children,
    chartFilters
}: FacetDataLoaderProps) => {
    const pageContext = usePageContext()
    const year = pageContext.currentEdition.year
    const showDefaultSeries = chartFilters.options.showDefaultSeries

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

            setSeries(seriesData)
            setIsLoading(false)
        }

        if (!isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    const props = isLoading
        ? {}
        : {
              series,
              chartDisplayMode: CHART_MODE_STACKED,
              facet: chartFilters.facet,
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

export default FacetDataLoader
