import React from 'react'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { ChartWrapper } from '../common2'

export interface SliderBlockProps extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

export const SliderBlock = (props: SliderBlockProps) => {
    const { block, series, question, pageContext, variant } = props

    return (
        <ChartWrapper question={question} className="chart-horizontal-bar">
            <div>slider</div>
        </ChartWrapper>
    )
}

export default SliderBlock
