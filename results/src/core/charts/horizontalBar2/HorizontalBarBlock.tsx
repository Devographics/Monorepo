import React from 'react'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets, getChartCompletion, useQuestionMetadata } from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getControls, getViewDefinition } from './helpers/views'
import View from '../common2/View'
import { ChartHeading, ChartWrapper, GridItem, GridWrapper, Legend } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionOptions } from './helpers/options'
import { useColorScale } from './helpers/colors'
import { ChartValues } from '../multiItemsExperience/types'
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

                {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />}

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
        facetQuestion: QuestionMetadata
        chartState: ChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const viewDefinition = getViewDefinition(chartState.view)
    const colorScale = facetQuestion && useColorScale({ question: facetQuestion })

    return (
        <ChartHeading
            heading={
                <FacetTitle
                    block={block}
                    facetQuestion={facetQuestion}
                    pageContext={pageContext}
                    entities={entities}
                />
            }
        >
            <div className="chart-horizontal-bar-controls">
                {viewDefinition.showLegend && facetQuestion && colorScale && (
                    <Legend
                        {...props}
                        options={getQuestionOptions({
                            question: facetQuestion,
                            chartState
                        })}
                        colorScale={colorScale}
                        i18nNamespace={facetQuestion.id}
                    />
                )}
                {/* {controls.length > 0 && <Controls controls={controls} {...props} />} */}
            </div>
        </ChartHeading>
    )
}
export default HorizontalBarBlock2
