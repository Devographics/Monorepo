import React from 'react'
import '../common2/ChartsCommon.scss'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getAllFacetBucketIds, getChartCurrentEdition, useQuestionMetadata } from './helpers/other'
import { getDefaultState, useChartState } from './helpers/chartState'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionOptions } from './helpers/options'
import { useColorScale } from '../common2/helpers/colors'
import { HorizontalBarChartState } from './types'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { HorizontalBarSerie } from './HorizontalBarSerie'
import ChartShare from '../common2/ChartShare'
import Legend from './Legend'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const currentEdition = getChartCurrentEdition({ serie: series[0], block })
    const { average, percentiles, completion } = currentEdition

    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState(getDefaultState({ facetQuestion, block }))

    const commonProps: CommonProps<HorizontalBarChartState> = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block
    }

    return (
        <ChartWrapper className="chart-horizontal-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />}

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

                <Note block={block} />

                <ChartFooter
                    left={
                        <Metadata
                            average={average}
                            median={percentiles?.p50}
                            completion={completion}
                            {...commonProps}
                        />
                    }
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
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

const FacetHeading = (
    props: CommonProps<HorizontalBarChartState> & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: HorizontalBarChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext, series } = props
    const { viewDefinition } = chartState
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const colorScale = facetQuestion && useColorScale({ question: facetQuestion })

    const allOptions = getQuestionOptions({
        question: facetQuestion,
        chartState
    })

    const allFacetBucketIds = getAllFacetBucketIds({ series, block, chartState })

    // only keep options that are actually used in the current dataset
    const usedOptions = allOptions.filter(option => allFacetBucketIds.includes(String(option.id)))

    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
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
