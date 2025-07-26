import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import {
    EditionWithRankAndPointData,
    ModesEnum,
    MultiRatiosChartState,
    MultiRatiosChartValues
} from '../types'
import min from 'lodash/min'
import max from 'lodash/max'
import range from 'lodash/range'
import sum from 'lodash/sum'
import round from 'lodash/round'
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
    const { getColumnIds, getPointValue } = viewDefinition
    const columnIds = getColumnIds(lineItems)

    // calculate average value for each column
    const columnAverages = columnIds.map(columnId => {
        const columnPoints = lineItems
            .map(lineItem => lineItem.points.find(p => p.columnId === columnId))
            .filter(point => !!point)
        const pointValues = columnPoints.map(point => getPointValue(point, chartState))
        const average = round(sum(pointValues) / pointValues.length, 1)
        return { columnId, average }
    })

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

    const tickValues = ticks.map(tick => tick.value)
    const minValue = min(tickValues) || 0
    const maxValue = max(tickValues) || 0

    const chartValues: MultiRatiosChartValues = {
        question,
        columnIds,
        totalColumns: columnIds.length,
        legendItems,
        minValue,
        maxValue,
        minTick: minValue,
        maxTick: maxValue,
        ticks,
        columnAverages
    }
    return chartValues
}
