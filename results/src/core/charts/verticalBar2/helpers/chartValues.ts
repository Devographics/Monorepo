import { QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { BasicPointData, LineItem, VerticalBarChartState, VerticalBarChartValues } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { getViewDefinition } from './views'
import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'

export const getYears = (allYears: number[]) => {
    const minYear = min(allYears)
    const maxYear = max(allYears)
    if (minYear === undefined || maxYear === undefined) {
        return []
    }
    const years = range(minYear, maxYear + 1)
    return years
}

export const useChartValues = <PointData extends BasicPointData>({
    lineItems,
    chartState,
    block,
    question
}: {
    lineItems: LineItem<PointData>
    chartState: VerticalBarChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const { i18nNamespace } = block
    const viewDefinition = getViewDefinition(chartState.view)
    const { getTicks, getColumnIds } = viewDefinition

    const columnIds = getColumnIds(lineItems)

    const chartValues: VerticalBarChartValues = {
        i18nNamespace,
        question,
        columnIds,
        totalColumns: columnIds.length,
        maxValue: 0
    }
    if (getTicks) {
        const ticks = getTicks()
        chartValues.ticks = ticks
        chartValues.maxValue = max(ticks.map(tick => tick.value)) || 0
    }
    return chartValues
}
