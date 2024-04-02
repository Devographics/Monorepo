import React from 'react'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import {
    getAllFacetBucketIds,
    getChartBuckets,
    getChartCompletion,
    useQuestionMetadata
} from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getViewDefinition } from './helpers/views'
import View from '../common2/View'
import { ChartWrapper, GridItem, GridWrapper, Legend } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionOptions } from './helpers/options'
import { useColorScale } from './helpers/colors'
import { ChartState } from './types'
import { CommonProps } from '../common2/types'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const completion = getChartCompletion({ block, serie: series[0] })
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState({ facetQuestion })

    const commonProps: CommonProps = {
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

                {facetQuestion && (
                    <FacetHeading series={series} facetQuestion={facetQuestion} {...commonProps} />
                )}

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => {
                        const buckets = getChartBuckets({ serie, block, chartState })
                        const chartValues = useChartValues({ buckets, chartState, block, question })

                        const viewProps = {
                            ...commonProps,
                            buckets,
                            chartValues
                        }

                        const itemFilters =
                            variant?.chartFilters?.filters?.[serieIndex] ||
                            block?.filtersState?.filters?.[serieIndex]
                        return (
                            <GridItem key={serie.name} filters={itemFilters}>
                                <View {...viewProps} />
                            </GridItem>
                        )
                    })}
                </GridWrapper>

                <Metadata completion={completion} {...commonProps} />
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
    props: CommonProps & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: ChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext, series } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const viewDefinition = getViewDefinition(chartState.view)
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
