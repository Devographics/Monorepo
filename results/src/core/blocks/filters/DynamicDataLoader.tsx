import React, { useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { combineBuckets, getFiltersQuery, invertFacets, useFilterLegends, calculateAverages } from './helpers'
import { runQuery } from 'core/blocks/explorer/data'
import Loading from 'core/blocks/explorer/Loading'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty'
import {
    BEHAVIOR_COMBINED,
    BEHAVIOR_MULTIPLE,
    MODE_FACET,
    MODE_FILTERS,
    CHART_MODE_STACKED,
    CHART_MODE_GROUPED,
    CHART_MODE_DEFAULT
} from './constants'
import { CustomizationDefinition } from './types'
import WrapperGrid from './WrapperGrid'
import { useAllChartsOptions } from 'core/charts/hooks'

const doNothing = a => a

const getSeriesData = (result: any, path: string) => {
    // example paths: "dataAPI.survey.demographics.${id}.year" or "dataAPI.survey.${id}.year"
    const pathSegments = path.split('.')
    const [apiSegment, surveySegment, sectionSegment, ...rest] = pathSegments
    if (path.includes('demographics')) {
        // result object of type survey.demographics.age_1
        return result[surveySegment][sectionSegment]
    } else {
        // result object of type survey.first_steps_1
        return result[surveySegment]
    }
}

/*

Take a series and get the buckets from its first facet

*/
const getSeriesItemBuckets = seriesItem => seriesItem?.year?.facets[0]?.buckets

type DynamicDataLoaderProps = {
    block: any
    processBuckets: Function
    setUnits: Dispatch<SetStateAction<number>>
    completion: any
    defaultBuckets: any
    children: ReactNode
    chartFilters: CustomizationDefinition
    setBuckets: Dispatch<SetStateAction<any>>
    layout: 'grid' | 'column'
}

const DynamicDataLoader = ({
    block,
    processBuckets = doNothing,
    setUnits,
    completion,
    defaultBuckets,
    children,
    chartFilters,
    setBuckets,
    layout = 'column'
}: DynamicDataLoaderProps) => {
    const theme = useTheme()
    const { getString } = useI18n()

    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = { name: 'default', buckets: defaultBuckets }

    // combined behavior: single series with a combined bucket
    const [combinedBuckets, setCombinedBuckets] = useState(defaultBuckets)
    // keep track of how many series are displayed within the combined bucket
    const [seriesCount, setSeriesCount] = useState(1)

    // multiple behavior: multiple series with normal buckets
    const [series, setSeries] = useState([defaultSeries])

    const context = usePageContext()
    const { currentEdition } = context
    const { year } = currentEdition

    const { options = {} } = chartFilters
    const { showDefaultSeries = true, behavior = BEHAVIOR_MULTIPLE, mode = MODE_FILTERS } = options

    const legends = useFilterLegends({
        chartFilters,
    })

    const initialLoad = useRef(true)

    const allChartsOptions = useAllChartsOptions()

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)

            const query = getFiltersQuery({ block, chartFilters, currentYear: year })

            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, `${block.id}FiltersQuery`)

            const seriesData = getSeriesData(result, block.dataPath)
            // console.log('// seriesData')
            // console.log(seriesData)

            if (mode === MODE_FILTERS) {
                if (behavior === BEHAVIOR_COMBINED) {
                    /*

                    Combine multiple series into a single chart

                    */
                    const newBuckets = Object.values(seriesData).map(getSeriesItemBuckets)

                    /*

                    In case buckets have a processing function applied (for example to merge them into
                    fewer buckets), apply it now to the new buckets

                    */

                    const combinedBuckets = combineBuckets({
                        defaultBuckets,
                        otherBucketsArrays: newBuckets.map(processBuckets),
                        completion
                    })

                    // percentage_question is the only unit that lets us
                    // meaningfully compare values across series
                    if (setUnits) {
                        setUnits('percentage_question')
                    }
                    setCombinedBuckets(combinedBuckets)
                    setSeriesCount(newBuckets.length)
                } else {
                    /*

                    Display multiple series as multiple side-by-side "small multiples" charts

                    */
                    const allSeries = [
                        ...(showDefaultSeries ? [defaultSeries] : []),
                        ...Object.keys(seriesData).map(name => ({
                            name,
                            buckets: getSeriesItemBuckets(seriesData[name])
                        }))
                    ]
                    // console.log('// allSeries')
                    // console.log(allSeries)
                    setSeries(allSeries)
                }
            } else if (mode === MODE_FACET) {
                const facets = seriesData[block.id]?.year?.facets
                const invertedFacetsBuckets = invertFacets({ facets, defaultBuckets, allChartsOptions })
                const invertedFacetsBucketsWithAverages = calculateAverages({ buckets: invertedFacetsBuckets, allChartsOptions, facet: chartFilters.facet})
                setUnits('percentage_bucket')
                setCombinedBuckets(invertedFacetsBucketsWithAverages)
            }
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0 || !isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    if (mode === MODE_FACET || (mode === MODE_FILTERS && behavior === BEHAVIOR_COMBINED)) {
        const chartDisplayMode = mode === MODE_FACET ? CHART_MODE_STACKED : CHART_MODE_GROUPED
        return (
            <SingleWrapper
                buckets={combinedBuckets}
                seriesCount={seriesCount}
                chartDisplayMode={chartDisplayMode}
                facet={chartFilters.facet}
                isLoading={isLoading}
                showDefaultSeries={showDefaultSeries}
            >
                {children}
            </SingleWrapper>
        )
    } else if (mode === MODE_FILTERS && behavior === BEHAVIOR_MULTIPLE) {
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
    } else {
        return React.cloneElement(children, {
            chartDisplayMode: CHART_MODE_DEFAULT
        })
    }
}

const SingleWrapper = ({ children, buckets, seriesCount, chartDisplayMode, facet, isLoading, showDefaultSeries }) => (
    <Wrapper_>
        <Contents_>
            {React.cloneElement(children, {
                buckets,
                seriesCount,
                chartDisplayMode,
                facet,
                showDefaultSeries,
            })}
        </Contents_>
        {isLoading && <Loading />}
    </Wrapper_>
)

const Wrapper_ = styled.div`
    position: relative;
`

const Contents_ = styled.div`
    flex: 1;
`

export default DynamicDataLoader
