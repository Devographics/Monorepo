import React, { useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react'
import styled, { css } from 'styled-components'
import { combineBuckets, getFiltersQuery } from './helpers'
import { runQuery } from 'core/blocks/explorer/data'
import Loading from 'core/blocks/explorer/Loading'
import { usePageContext } from 'core/helpers/pageContext'
import { spacing, mq, fontSize } from 'core/theme'
import { getLegends } from 'core/blocks/filters/helpers'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import Tooltip from 'core/components/Tooltip'

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
    seriesCount: number
    setSeriesCount: Dispatch<SetStateAction<number>>
    setUnits: Dispatch<SetStateAction<number>>
    completion: any
    defaultBuckets: any
    children: ReactNode
    chartFilters: any
    setBuckets: Dispatch<SetStateAction<any>>
    mode: 'combine' | 'multiple'
    layout: 'grid' | 'column'
}

const DynamicDataLoader = ({
    block,
    processBuckets = doNothing,
    seriesCount,
    setSeriesCount,
    setUnits,
    completion,
    defaultBuckets,
    children,
    chartFilters,
    setBuckets,
    mode = 'combine',
    layout = 'column'
}: DynamicDataLoaderProps) => {
    const theme = useTheme()
    const { getString } = useI18n()

    const [isLoading, setIsLoading] = useState(false)
    const defaultSeries = { name: 'default', buckets: defaultBuckets }
    const [combinedBuckets, setCombinedBuckets] = useState(defaultBuckets)
    const [series, setSeries] = useState([defaultSeries])

    const context = usePageContext()
    const { currentEdition } = context
    const { year } = currentEdition

    const legends = getLegends({ theme, chartFilters, getString, currentYear: year })

    const initialLoad = useRef(true)

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

            if (mode === 'combine') {
                /*

                Combine multiple series into a single chart

                */
                const newBuckets = Object.values(seriesData).map(getSeriesItemBuckets)

                /*

                In case buckets have a processing function applied (for example to merge them into
                fewer buckets), apply it now to the new buckets

                */
                const bucketsArrays = [defaultBuckets, ...newBuckets.map(processBuckets)]

                const combinedBuckets = combineBuckets({
                    bucketsArrays,
                    completion
                })

                // percentage_question is the only unit that lets us
                // meaningfully compare values across series
                setUnits('percentage_question')
                setCombinedBuckets(combinedBuckets)
                setSeriesCount(series.length)
            } else {
                /*

                Display multiple series as multiple side-by-side charts

                */
                const allSeries = [
                    defaultSeries,
                    ...Object.keys(seriesData).map(name => ({
                        name,
                        buckets: getSeriesItemBuckets(seriesData[name])
                    }))
                ]
                setSeries(allSeries)
            }
            setIsLoading(false)
        }

        if (chartFilters.length > 0) {
            getData()
        }
    }, [chartFilters])

    if (mode === 'multiple') {
        return (
            <GridWrapper_ layout={layout}>
                {series.map(({ name, buckets }, i) => (
                    <GridItem_ key={name}>
                        {legends && legends.length > 0 && (
                            <Tooltip
                                trigger={
                                    <Legend_>
                                        <span>{legends[i]?.label}</span>
                                    </Legend_>
                                }
                                contents={<span>{legends[i]?.label}</span>}
                            />
                        )}
                        <Contents_>{React.cloneElement(children, { buckets, barColor: theme.colors.barColors[i] })}</Contents_>
                        {isLoading && <Loading />}
                    </GridItem_>
                ))}
            </GridWrapper_>
        )
    } else {
        return (
            <Wrapper_>
                <Contents_>
                    {React.cloneElement(children, { combinedBuckets, seriesCount })}
                </Contents_>
                {isLoading && <Loading />}
            </Wrapper_>
        )
    }
}

const Wrapper_ = styled.div`
    position: relative;
`

const GridWrapper_ = styled.div`
    ${({ layout }) =>
        layout === 'grid'
            ? css`
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                  gap: ${spacing(2)};
              `
            : css`
                  display: flexbox;
                  flex-direction: column;
                  gap: ${spacing()};
              `}
`

const GridItem_ = styled.div`
    position: relative;
    overflow: hidden;
`

const Legend_ = styled.h4`
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: ${spacing(0.25)} ${spacing(0.5)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    font-size: ${fontSize('small')};
`

const Contents_ = styled.div``

export default DynamicDataLoader
