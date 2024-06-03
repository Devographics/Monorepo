import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { MultiRatiosChartState, MultiRatiosChartValues } from '../types'
import max from 'lodash/max'
import { getYears } from 'core/charts/verticalBar2/helpers/chartValues'

export const useChartValues = ({
    items,
    chartState,
    block,
    question
}: {
    items: StandardQuestionData[]
    chartState: MultiRatiosChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const allYears = items
        .map(item => item.responses.allEditions.map(edition => edition.year))
        .flat()
    const years = getYears(allYears)
    const allEditionsCounts = items.map(item => item.responses.allEditions.length || 0)
    const chartValues: MultiRatiosChartValues = {
        question,
        years,
        totalColumns: max(allEditionsCounts) || 0,
        maxValue: 100,
        ticks: [
            { value: 0 },
            { value: 20 },
            { value: 40 },
            { value: 60 },
            { value: 80 },
            { value: 100 }
        ]
    }
    return chartValues
}
