import { QuestionMetadata } from '@devographics/types'
import { MultiItemsChartState, MultiItemsChartValues, CombinedItem } from '../types'

export const useChartValues = ({
    items,
    chartState,
    question
}: {
    items: CombinedItem[]
    chartState: MultiItemsChartState
    question: QuestionMetadata
}) => {
    const chartValues: MultiItemsChartValues = {
        totalRows: items.length,
        question,
        facetQuestion: {
            id: '_sentiment'
        } as QuestionMetadata
    }
    return chartValues
}
