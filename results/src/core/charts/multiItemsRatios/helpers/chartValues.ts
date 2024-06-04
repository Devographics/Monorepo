import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { Modes, MultiRatiosChartState, MultiRatiosChartValues } from '../types'
import max from 'lodash/max'
import { getYears } from 'core/charts/verticalBar2/helpers/chartValues'
import { LegendItem } from '../Legend'
import range from 'lodash/range'

export const useChartValues = ({
    items,
    chartState,
    block,
    question,
    legendItems
}: {
    items: StandardQuestionData[]
    chartState: MultiRatiosChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
    legendItems: LegendItem[]
}) => {
    const { mode } = chartState
    const allYears = items
        .map(item => item.responses.allEditions.map(edition => edition.year))
        .flat()
    const years = getYears(allYears)
    const allEditionsCounts = items.map(item => item.responses.allEditions.length || 0)
    const ticks =
        mode === Modes.VALUE
            ? [
                  { value: 0 },
                  { value: 20 },
                  { value: 40 },
                  { value: 60 },
                  { value: 80 },
                  { value: 100 }
              ]
            : range(0, legendItems.length)
                  .map(i => ({ value: i }))
                  .toReversed()

    const chartValues: MultiRatiosChartValues = {
        question,
        years,
        totalColumns: max(allEditionsCounts) || 0,
        legendItems,
        maxValue: max(ticks.map(tick => tick.value)) || 0,
        ticks
    }
    return chartValues
}
