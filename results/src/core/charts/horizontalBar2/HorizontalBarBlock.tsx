import React from 'react'
import '../common2/ChartsCommon.scss'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import {
    getChartCurrentEdition,
    getSerieMetadataProps,
    getSeriesMetadata,
    useQuestionMetadata
} from './helpers/other'
import { getDefaultState, useChartState } from './helpers/chartState'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { HorizontalBarChartState } from './types'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { HorizontalBarSerie } from './HorizontalBarSerie'
import ChartShare from '../common2/ChartShare'
import { BackToBack } from '../common2/BackToBack'
import { NoData } from '../common2/NoData'
import { getViewDefinition } from './helpers/views'
import FacetHeading from './FacetHeading'
import BucketsFilterHeading from '../common2/BucketsFilterHeading'
import { getBucketsFilter } from '../common2/helpers'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const currentEdition = getChartCurrentEdition({ serie: series[0] })
    if (!currentEdition) {
        console.log('// no data found')
        console.log(props)
        return <NoData<HorizontalBarBlock2Props> {...props} />
    }

    // note: block.filtersState will also reflect filters set using the query builder
    // note: keep block?.filtersState?.axis2 for backwards compatibility with YAML configs for now
    const facet = block?.filtersState?.axis2 || block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState(getDefaultState({ facetQuestion, block }))

    const bucketsFilter = getBucketsFilter({ variant, block })

    const viewDefinition = getViewDefinition(chartState.view)

    const seriesMetadata = getSeriesMetadata({
        series,
        block,
        chartState,
        viewDefinition,
        currentEdition
    })

    const metadataProps = getSerieMetadataProps({ currentEdition })

    const commonProps: CommonProps<HorizontalBarChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block,
        seriesMetadata,
        metadataProps
    }

    // // figure out if all series are sorted by options
    // const allSortedByOptions = series.every(serie => {
    //     const serieMetadata = getSerieMetadata({ serie, block })
    //     return serieMetadata?.axis1Sort?.property === sortProperties.OPTIONS
    // })

    const useBackToBackSeriesView = () => {
        if (series.length === 2) {
            // make sure both series have same items in order to use back-to-back view
            const s1 = series[0]
            const s2 = series[1]
            const e1 = getChartCurrentEdition({ serie: s1 })
            const e2 = getChartCurrentEdition({ serie: s2 })
            const b1 = e1.buckets
            const b2 = e2.buckets
            const items1 = b1.map(b => b.id).toSorted()
            const items2 = b2.map(b => b.id).toSorted()
            return JSON.stringify(items1) === JSON.stringify(items2)
        }
        return false
    }

    return (
        <ChartWrapper block={block} question={question} className="chart-horizontal-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                {/* <pre>
                    <code>{JSON.stringify(facetQuestion, null, 2)}</code>
                </pre> */}

                {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />}

                {bucketsFilter && (
                    <BucketsFilterHeading {...commonProps} bucketsFilter={bucketsFilter} />
                )}

                {useBackToBackSeriesView() ? (
                    <BackToBack serie1={series[0]} serie2={series[1]} {...commonProps} />
                ) : (
                    <GridWrapper seriesCount={series.length}>
                        {series.map((serie, serieIndex) => (
                            <HorizontalBarSerie
                                key={serie.name}
                                serie={serie}
                                serieIndex={serieIndex}
                                {...commonProps}
                            />
                        ))}
                    </GridWrapper>
                )}

                <Note block={block} />

                <ChartFooter
                    left={<Metadata<HorizontalBarChartState> {...commonProps} {...metadataProps} />}
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData<HorizontalBarChartState> {...commonProps} />
                        </>
                    }
                />

                {/* <Actions {...commonProps} /> */}
                {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}

                {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
            </>
        </ChartWrapper>
    )
}
export default HorizontalBarBlock2
