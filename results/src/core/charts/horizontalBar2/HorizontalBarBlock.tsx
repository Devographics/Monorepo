import React from 'react'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import { BlockComponentProps, BlockDefinition } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets, getChartCompletion, useQuestionMetadata } from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getControls, getViewDefinition } from './helpers/views'
import View from '../common2/View'
import { useI18n } from '@devographics/react-i18n'
import { ChartHeading, ChartWrapper, Legend } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetQuestion } from '../common2/FacetQuestion'
import { getQuestionOptions } from './helpers/options'
import { useColorScale } from './helpers/colors'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, question, pageContext } = props
    const entities = useEntities()
    // console.log(props)

    const completion = getChartCompletion(props)
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)
    const facetBlock = {
        id: facetQuestion?.id,
        sectionId: facetQuestion?.sectionId
    } as BlockDefinition

    const { getString } = useI18n()
    const chartState = useChartState({ facetQuestion })
    const buckets = getChartBuckets({ ...props, chartState })

    const chartValues = useChartValues({ buckets, chartState, block, question })
    const controls = getControls({ chartState, chartValues })

    const viewDefinition = getViewDefinition(chartState.view)
    const commonProps = {
        buckets,
        chartState,
        chartValues,
        block
    }

    const options = getQuestionOptions({ question, chartState })
    const colorScale = chartValues?.facetQuestion && useColorScale({ question })

    return (
        <ChartWrapper className="chart-horizontal-bar">
            <>
                {/* <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre> */}

                {facetQuestion && (
                    <ChartHeading>
                        <>
                            <FacetQuestion
                                facetQuestion={facetQuestion}
                                pageContext={pageContext}
                                entities={entities}
                            />
                            {controls.length > 0 && (
                                <Controls controls={controls} {...commonProps} />
                            )}

                            {viewDefinition.showLegend && facetQuestion && colorScale && (
                                <Legend
                                    {...commonProps}
                                    options={options}
                                    colorScale={colorScale}
                                    question={facetQuestion}
                                />
                            )}
                        </>
                    </ChartHeading>
                )}

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

export default HorizontalBarBlock2
