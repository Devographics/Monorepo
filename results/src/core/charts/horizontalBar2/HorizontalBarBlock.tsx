import React, { useRef } from 'react'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import { BlockComponentProps, BlockDefinition } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets, getChartCompletion, useQuestionMetadata } from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getControls, getViewDefinition } from './helpers/views'
import Actions from '../common2/Actions'
import View from '../common2/View'
import BlockQuestion from 'core/blocks/block/BlockQuestion'
import { getBlockKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import { Legend } from '../common2'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, question } = props
    // console.log(props)
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    const completion = getChartCompletion(props)
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    // const { getString } = useI18n()
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
        <div className="chart-horizontal-bar">
            {/* <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre> */}
            <div className="chart-facet">
                <div className="chart-facet-content" ref={parent}>
                    {facetQuestion && <FacetQuestion facetQuestion={facetQuestion} />}
                    {controls.length > 0 && <Controls controls={controls} {...commonProps} />}
                    {viewDefinition.showLegend && <Legend {...commonProps} />}
                </div>
            </div>
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

const FacetQuestion = ({ facetQuestion }: { facetQuestion: QuestionMetadata }) => {
    const { getString } = useI18n()

    const facetBlock = {
        id: facetQuestion?.id,
        sectionId: facetQuestion?.sectionId
    } as BlockDefinition
    const facetQuestionKey = `${getBlockKey({ block: facetBlock })}.question`
    const translation = getString(facetQuestionKey)?.t
    return <BlockQuestion question={translation} />
}
export default HorizontalBarBlock2
