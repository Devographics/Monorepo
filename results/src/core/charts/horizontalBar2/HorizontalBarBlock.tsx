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
import { ChartHeading, ChartWrapper, Legend } from '../common2'
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
    const { block, question, pageContext } = props
    // console.log(props)

    const completion = getChartCompletion(props)
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState({ facetQuestion })
    const buckets = getChartBuckets({ ...props, chartState })

    const chartValues = useChartValues({ buckets, chartState, block, question })

    const commonProps: CommonProps = {
        pageContext,
        buckets,
        chartState,
        chartValues,
        block
    }

    return (
        <ChartWrapper className="chart-horizontal-bar">
            <>
                {/* <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre> */}

                {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />}

                <View {...commonProps} />

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
        chartValues: ChartValues
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, chartValues, pageContext } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const viewDefinition = getViewDefinition(chartState.view)
    const colorScale = chartValues?.facetQuestion && useColorScale({ question: facetQuestion })

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
