import { QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { VerticalBarChartState, VerticalBarChartValues } from '../types'
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
    const years = getYears(editions.map(e => e.year))
    const chartValues: VerticalBarChartValues = {
        question,
        totalColumns: editions.length,
        years,
        maxValue: 0
    }
    if (getTicks) {
        const ticks = getTicks()
        chartValues.ticks = ticks
        chartValues.maxValue = max(ticks.map(tick => tick.value)) || 0
    }

    return chartValues
}
