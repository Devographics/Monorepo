import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { EditionWithRank, Modes, MultiRatiosChartState, MultiRatiosChartValues } from '../types'
import max from 'lodash/max'
import { getYears } from 'core/charts/verticalBar2/helpers/chartValues'
import { LegendItem } from '../Legend-old'
import range from 'lodash/range'
import { getAllEditions } from './other'
import { LineItem } from 'core/charts/verticalBar2/types'

export const useChartValues = ({
    lineItems,
    chartState,
    block,
    question,
    legendItems
}: {
    lineItems: LineItem<EditionWithRank>[]
    chartState: MultiRatiosChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
    legendItems: LegendItem[]
}) => {
    const { mode } = chartState
    const allYears = lineItems.map(item => getAllEditions(item).map(edition => edition.year)).flat()
    const columnIds = getYears(allYears).map(y => y.toString())
    const allEditionsCounts = lineItems.map(item => getAllEditions(item).length || 0)
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
        columnIds,
        totalColumns: columnIds.length,
        legendItems,
        maxValue: max(ticks.map(tick => tick.value)) || 0,
        ticks
    }
    return chartValues
}
