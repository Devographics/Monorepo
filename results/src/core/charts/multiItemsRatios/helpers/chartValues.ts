import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import {
    EditionWithRankAndPointData,
    ModesEnum,
    MultiRatiosChartState,
    MultiRatiosChartValues
} from '../types'
import max from 'lodash/max'
import range from 'lodash/range'
import { viewDefinition } from './viewDefinition'
import { LineItem } from 'core/charts/verticalBar2/types'
import { LegendItem } from 'core/charts/common2/types'

export const useChartValues = ({
    lineItems,
    chartState,
    question,
    legendItems
}: {
    lineItems: LineItem<EditionWithRankAndPointData>[]
    chartState: MultiRatiosChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
    legendItems: LegendItem[]
}) => {
    const { mode } = chartState
    const { getColumnIds } = viewDefinition
    const columnIds = getColumnIds(lineItems)
    const ticks =
        mode === ModesEnum.VALUE
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
