import React from 'react'
import './HorizontalBar.scss'
import Metadata from '../common2/Metadata'
import Controls from '../common2/Controls'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets, getChartCompletion, useQuestionMetadata } from './helpers/other'
import { useChartState } from './helpers/chartState'
import { useChartValues } from './helpers/chartValues'
import { getControls, getViewDefinition } from './helpers/views'
import Actions from '../common2/Actions'
import View from '../common2/View'

export interface HorizontalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const HorizontalBarBlock2 = (props: HorizontalBarBlock2Props) => {
    const { block, question } = props
    // console.log(props)

    const completion = getChartCompletion(props)
    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    // const { getString } = useI18n()
    const chartState = useChartState({ facetQuestion })
    const className = `foo`
    const view = getViewDefinition(chartState.view)
    const buckets = getChartBuckets({ ...props, steps: view.steps })

    const chartValues = useChartValues({ buckets, chartState, block, question })
    const controls = getControls({ chartState, chartValues })

    const commonProps = {
        buckets,
        chartState,
        chartValues,
        block
    }

    return (
        <div className={className}>
            <pre>
                <code>{JSON.stringify(chartState, null, 2)}</code>
            </pre>
            <Controls controls={controls} {...commonProps} />
            <View {...commonProps} />

            <Metadata completion={completion} {...commonProps} />
            <Actions {...commonProps} />
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
