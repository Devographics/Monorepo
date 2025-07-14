import { QuestionMetadata } from '@devographics/types'
import {
    BasicPointData,
    LineItem,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import { BlockVariantDefinition } from 'core/types'
import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'
import { useAllQuestions, useAllQuestionsWithOptions } from 'core/charts/hooks'

export const getYears = (allYears: number[]) => {
    const minYear = min(allYears)
    const maxYear = max(allYears)
    if (minYear === undefined || maxYear === undefined) {
        return []
    }
    const years = range(minYear, maxYear + 1)
    return years
}

export const useChartValues = <SerieData, PointData extends BasicPointData, ChartStateType>({
    lineItems,
    chartState,
    block,
    question,
    viewDefinition,
    facetBuckets
}: {
    lineItems: LineItem<PointData>[]
    chartState: ChartStateType
    block: BlockVariantDefinition
    question: QuestionMetadata
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}) => {
    const { i18nNamespace } = block
    // const { view } = chartState
    // const viewDefinition = getViewDefinition(view)
    const { getTicks, getColumnIds, getPointValue } = viewDefinition
    const columnIds = getColumnIds(lineItems)
    const allQuestions = useAllQuestions()
    const { facet } = chartState

    const flatLineItemValues = lineItems
        .map(lineItem => lineItem.points.map(point => getPointValue(point, chartState)))
        .flat()
    const minValue = min(flatLineItemValues) as number
    const maxValue = max(flatLineItemValues) as number

    const chartValues: VerticalBarChartValues = {
        i18nNamespace,
        question,
        columnIds,
        totalColumns: columnIds.length,
        minValue,
        maxValue,
        facetBuckets
    }
    if (getTicks) {
        const ticks = getTicks(maxValue)
        chartValues.ticks = ticks
        chartValues.maxTick = max(ticks.map(t => t.value)) || 0
        chartValues.minTick = min(ticks.map(t => t.value)) || 0
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
