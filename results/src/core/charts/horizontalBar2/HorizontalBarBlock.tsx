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
import { Legend } from '../common2'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useEntities } from 'core/helpers/entities'
import { FacetQuestion } from '../common2/FacetQuestion'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, question, pageContext } = props
    const entities = useEntities()
    // console.log(props)
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

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

    return (
        <div className="chart-horizontal-bar" ref={parent}>
            {/* <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre> */}

            <div className="chart-heading">
                <div className="chart-heading-question">
                    {/* {getBlockTitle({ block, pageContext, getString, entities })} */}
                </div>
                {facetQuestion && (
                    <div className="chart-heading-facet">
                        <FacetQuestion
                            facetQuestion={facetQuestion}
                            pageContext={pageContext}
                            entities={entities}
                        />

                        {controls.length > 0 && <Controls controls={controls} {...commonProps} />}
                    </div>
                )}
            </div>
            {viewDefinition.showLegend && <Legend {...commonProps} />}

            <View {...commonProps} />

            <Metadata completion={completion} {...commonProps} />
            {/* <Actions {...commonProps} /> */}
            {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </div>
    )
}

export default HorizontalBarBlock2
