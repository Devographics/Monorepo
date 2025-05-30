import React from 'react'
import '../common2/ChartsCommon.scss'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData, sortProperties } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import {
    getAllFacetBucketIds,
    getChartCurrentEdition,
    getSerieMetadata,
    getSerieMetadataProps,
    getSeriesMetadata,
    useQuestionMetadata
} from './helpers/other'
import { getDefaultState, useChartState } from './helpers/chartState'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionGroups, getQuestionOptions } from './helpers/options'
import { useColorScale } from '../common2/helpers/colors'
import { HorizontalBarChartState, HorizontalBarViews } from './types'
import { CommonProps, SerieMetadata } from '../common2/types'
import ChartData from '../common2/ChartData'
import { HorizontalBarSerie } from './HorizontalBarSerie'
import ChartShare from '../common2/ChartShare'
import Legend from './Legend'
import { BackToBack } from '../common2/BackToBack'
import { NoData } from '../common2/NoData'
import { getViewDefinition } from './helpers/views'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const currentEdition = getChartCurrentEdition({ serie: series[0], block })
    if (!currentEdition) {
        console.log(props)
        return <NoData<HorizontalBarBlock2Props> {...props} />
    }

    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState(getDefaultState({ facetQuestion, block }))

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

    // figure out if all series are sorted by options
    const allSortedByOptions = series.every(serie => {
        const serieMetadata = getSerieMetadata({ serie, block })
        return serieMetadata?.axis1Sort?.property === sortProperties.OPTIONS
    })
    const useBackToBackSeriesView = series.length === 2 && allSortedByOptions

    return (
        <ChartWrapper question={question} className="chart-horizontal-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}
                {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />}

                {useBackToBackSeriesView ? (
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
                    left={<Metadata {...commonProps} {...metadataProps} />}
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

export const FacetHeading = (
    props: CommonProps<HorizontalBarChartState> & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: HorizontalBarChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext, series, question } = props
    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const colorScale = facetQuestion && useColorScale({ question: facetQuestion })

    const allOptions = getQuestionOptions({
        question: facetQuestion,
        chartState
    })
    const allGroups = getQuestionGroups({
        question: facetQuestion,
        chartState
    })
    const allGroupsOrOptions = allGroups?.length > 1 ? allGroups : allOptions

    const allFacetBucketIds = getAllFacetBucketIds({ series, block, chartState })

    // only keep options that are actually used in the current dataset
    const usedOptions = allGroupsOrOptions.filter(optionOrGroup =>
        allFacetBucketIds.includes(String(optionOrGroup.id))
    )

    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
            />
            {viewDefinition.showLegend && facetQuestion && colorScale && (
                <Legend
                    {...props}
                    options={usedOptions}
                    colorScale={colorScale}
                    i18nNamespace={facetQuestion.id}
                />
            )}
        </div>
    )
}
export default HorizontalBarBlock2
