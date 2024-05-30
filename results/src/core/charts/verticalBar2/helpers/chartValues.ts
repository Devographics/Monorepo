import { QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { VerticalBarChartState, VerticalBarChartValues } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { getViewDefinition } from './views'

export const useChartValues = ({
    editions,
    chartState,
    block,
    question
}: {
    editions: ResponseEditionData[]
    chartState: VerticalBarChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const viewDefinition = getViewDefinition(chartState.view)
    const { getTicks } = viewDefinition
    const chartValues: VerticalBarChartValues = {
        question,
        totalColumns: editions.length
    }
    if (getTicks) {
        chartValues.ticks = getTicks()
    }
    return chartValues
}
