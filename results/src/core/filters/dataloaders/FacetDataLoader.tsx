import React, { useState, useEffect } from 'react'
import { fetchSeriesData } from '../helpers'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import isEmpty from 'lodash/isEmpty'
import { CHART_MODE_STACKED } from '../constants'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import Loading from 'core/explorer/Loading'
import styled from 'styled-components'
import { DataSeries } from '../types'
import { JSONTrigger } from 'core/blocks/block/BlockData'
import { BucketUnits } from '@devographics/types'
import T from 'core/i18n/T'
import { Note_ } from 'core/blocks/block/BlockNote'

interface FacetDataLoaderProps extends DynamicDataLoaderProps {
    defaultSeries: DataSeries<AllQuestionData>
}

const FacetDataLoader = ({
    defaultSeries,
    block,
    children,
    chartFilters,
    units,
    setUnits
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
            setUnits(BucketUnits.PERCENTAGE_BUCKET)
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
            {series && (
                <JSONTrigger block={block} data={series} buttonProps={{ variant: 'link' }} />
            )}
            {units === BucketUnits.PERCENTAGE_BUCKET && (
                <Note_>
                    <T k="charts.facets_clarification" />
                </Note_>
            )}
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
