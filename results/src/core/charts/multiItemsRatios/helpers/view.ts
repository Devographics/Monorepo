import { EditionWithPointData, VerticalBarViewDefinition } from 'core/charts/verticalBar2/types'
import { EditionWithRank, Modes, MultiRatiosChartState } from '../types'
import { StandardQuestionData } from '@devographics/types'
import { getEditionByYear } from '../../verticalBar2/helpers/other'
import sortBy from 'lodash/sortBy'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import min from 'lodash/min'

export const getAllEditions = (item: StandardQuestionData) => item?.responses?.allEditions || []

export const multiRatiosViewDefinition: VerticalBarViewDefinition<
    StandardQuestionData[],
    EditionWithRank,
    MultiRatiosChartState
> = {
    getLineItems: ({ serie, question, chartState }) => {
        const { view } = chartState
        const items = serie.data
        const allYears = items
            .map(item => item.responses.allEditions)
            .flat()
            .map(e => e.year)
        const startYear = min(allYears) ?? 0
        const itemsWithRank = items.map(item => ({
            ...item,
            points: getAllEditions(item).map(edition => {
                // find ratios for all items for current year/edition
                let allItemsRatios = items.map(item => {
                    // for each item, get the edition of the same year as the one we're currently looking at
                    const sameYearEdition = getEditionByYear(edition.year, getAllEditions(item))
                    const ratio = sameYearEdition?.ratios?.[view]
                    return { id: item.id, ratio }
                })
                // discard any undefined ratios
                allItemsRatios = allItemsRatios.filter(r => r.ratio !== undefined)
                // sort by ratio, descending
                allItemsRatios = sortBy(allItemsRatios, r => r.ratio).toReversed()
                // find current item's rank among all items (for same edition)
                const rank = allItemsRatios.findIndex(r => r.id === item.id) + 1
                return {
                    ...edition,
                    rank,
                    value: edition?.ratios?.[view],
                    columnIndex: edition.year - startYear
                }
            })
        }))
        return itemsWithRank
    },
    formatValue: (value, question, chartState) =>
        chartState.mode === Modes.VALUE ? formatPercentage(value) : `#${value + 1}`,
    getPointValue: (point, chartState) =>
        chartState.mode === Modes.VALUE
            ? Math.floor((point?.ratios?.[chartState.view] || 0) * 100)
            : point.rank - 1
}
