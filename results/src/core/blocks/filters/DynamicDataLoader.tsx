import React, { useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import {
    combineBuckets,
    getFiltersQuery,
    invertFacets,
    useFilterLegends,
    calculateAverages
} from './helpers'
import { runQuery } from 'core/blocks/explorer/data'
import Loading from 'core/blocks/explorer/Loading'
import { usePageContext } from 'core/helpers/pageContext'
// import { spacing, mq, fontSize } from 'core/theme'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import isEmpty from 'lodash/isEmpty'
import {
    MODE_FACET,
    MODE_COMBINED,
    MODE_GRID,
    CHART_MODE_STACKED,
    CHART_MODE_GROUPED,
    CHART_MODE_DEFAULT
} from './constants'
import { CustomizationDefinition } from './types'
import WrapperGrid from './WrapperGrid'
import { useAllChartsOptions } from 'core/charts/hooks'
import { BlockDefinition } from 'core/types'
import get from 'lodash/get'

const doNothing = a => a

const getSeriesData = ({ result, path }: { result: any; path: string }) => {
    // example paths: "dataAPI.survey.demographics.yearly_salary1.year" or "dataAPI.survey.podcasts2.year"
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
    processBlockData: Function
    processBlockDataOptions: any
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
    processBlockData = doNothing,
    processBlockDataOptions = {},
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
    const { showDefaultSeries = true, mode } = options

    const legends = useFilterLegends({
        chartFilters
    })

    const initialLoad = useRef(true)

    const allChartsOptions = useAllChartsOptions()

    useEffect(() => {
        if (initialLoad.current && !chartFilters.queryOnLoad) {
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)

            const { query, seriesNames } = getFiltersQuery({
                block,
                chartFilters,
                currentYear: year
            })

            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, `${block.id}FiltersQuery`)

            console.log('// result')
            console.log(result)

            const dataPath = block.dataPath.replace('dataAPI.', '')

            if (mode === MODE_GRID || mode === MODE_COMBINED) {
                // apply dataPath to get block data for each series
                const seriesBlockData = seriesNames.map(seriesName =>
                    get(result, dataPath.replace(block.id, seriesName))
                )
                // apply processBlockData to get chart data (buckets) for each series
                const seriesChartData = seriesBlockData.map((blockData, i) =>
                    processBlockData(blockData, {
                        ...processBlockDataOptions,
                        seriesName: seriesNames[i]
                    })
                )
                // console.log('// DynamicDataLoader')
                // console.log(seriesBlockData)
                // console.log(seriesChartData)

                if (mode === MODE_COMBINED) {
                    /*

                    Combine multiple series into a single chart

                    */

                    /*

                    In case buckets have a processing function applied (for example to merge them into
                    fewer buckets), apply it now to the new buckets

                    */

                    const combinedBuckets = combineBuckets({
                        defaultBuckets,
                        otherBucketsArrays: seriesChartData,
                        completion
                    })

                    // percentageQuestion is the only unit that lets us
                    // meaningfully compare values across series
                    if (setUnits) {
                        setUnits('percentageQuestion')
                    }
                    setCombinedBuckets(combinedBuckets)
                    setSeriesCount(seriesChartData.length)
                } else {
                    /*

                    Display multiple series as multiple side-by-side "small multiples" charts

                    */
                    const allSeries = [
                        ...(showDefaultSeries ? [defaultSeries] : []),
                        ...seriesNames.map((name, i) => ({
                            name,
                            buckets: seriesChartData[i]
                        }))
                    ]
                    setSeries(allSeries)
                }
            } else if (mode === MODE_FACET) {
                // apply dataPath to get block data for each series
                const blockData = get(result, dataPath)
                const facets = blockData?.facets

                const invertedFacetsBuckets = invertFacets({
                    facets,
                    defaultBuckets
                })
                const invertedFacetsBucketsWithAverages = calculateAverages({
                    buckets: invertedFacetsBuckets,
                    allChartsOptions,
                    facet: chartFilters.facet
                })
                setUnits('percentage_bucket')
                setCombinedBuckets(invertedFacetsBucketsWithAverages)
            }
            setIsLoading(false)
        }

        if (chartFilters?.filters?.length > 0 || !isEmpty(chartFilters.facet)) {
            getData()
        }
    }, [chartFilters])

    if (mode === MODE_FACET || mode === MODE_COMBINED) {
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
    } else if (mode === MODE_GRID) {
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

const SingleWrapper = ({
    children,
    buckets,
    seriesCount,
    chartDisplayMode,
    facet,
    isLoading,
    showDefaultSeries
}) => (
    <Wrapper_>
        <Contents_>
            {React.cloneElement(children, {
                buckets,
                seriesCount,
                chartDisplayMode,
                facet,
                showDefaultSeries
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
