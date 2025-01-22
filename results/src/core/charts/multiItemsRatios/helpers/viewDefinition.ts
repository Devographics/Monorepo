import { MultiRatiosChartState } from '../types'
import { LineItem, VerticalBarViewDefinition } from 'core/charts/verticalBar2/types'
import { EditionWithRankAndPointData, ModesEnum } from '../types'
import { StandardQuestionData } from '@devographics/types'
import { getEditionByYear } from '../../verticalBar2/helpers/other'
import sortBy from 'lodash/sortBy'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import max from 'lodash/max'
import min from 'lodash/min'
import range from 'lodash/range'
import compact from 'lodash/compact'

export const getAllEditions = (item: StandardQuestionData) => item?.responses?.allEditions || []

export const viewDefinition: VerticalBarViewDefinition<
    StandardQuestionData[],
    EditionWithRankAndPointData,
    MultiRatiosChartState
> = {
    getLineItems: ({ serie, chartState }) => {
        const { view } = chartState
        const lineItems = serie.data
        const allYears = lineItems
            .map(item => item.responses.allEditions)
            .flat()
            .map(e => e.year)
        const startYear = min(allYears) ?? 0
        const lineItemsWithRank = lineItems.map(lineItem => {
            const itemAllEditions = getAllEditions(lineItem)
            return {
                ...lineItem,
                points: compact(
                    itemAllEditions.map(currentEdition => {
                        const value = currentEdition?.ratios?.[view]
                        if (value === 0) {
                            // if a ratio is 0, it almost certainly means
                            // we don't have enough data for this point
                            // and it should not be displayed
                            return
                        } else {
                            // find ratios for all line items for current year/edition
                            let allItemsRatios = lineItems.map(currentItem => {
                                // for each line item, get the edition of the same year
                                // as the edition we're currently looking at
                                const sameYearEdition = getEditionByYear(
                                    currentEdition.year,
                                    getAllEditions(currentItem)
                                )
                                const ratio = sameYearEdition?.ratios?.[view]
                                return { id: currentItem.id, ratio }
                            })
                            // discard any undefined ratios
                            allItemsRatios = allItemsRatios.filter(r => r.ratio !== undefined)
                            // sort by ratio, descending
                            allItemsRatios = sortBy(allItemsRatios, r => r.ratio).toReversed()
                            // find current item's rank among all items (for same edition)
                            const rank = allItemsRatios.findIndex(r => r.id === lineItem.id) + 1
                            return {
                                ...currentEdition,
                                id: currentEdition.editionId,
                                rank,
                                value,
                                columnId: currentEdition.year.toString(),
                                columnIndex: currentEdition.year - startYear
                            }
                        }
                    })
                )
            }
        })
        return lineItemsWithRank
    },
    getColumnIds: (lineItems: LineItem<EditionWithRankAndPointData>[]) => {
        // since we have multiple lines, make sure we collect years from all of them
        const allYears = lineItems
            .map(l => l.points)
            .flat()
            .map(p => p.year)
        const minYear = min(allYears)
        const maxYear = max(allYears)
        if (minYear === undefined || maxYear === undefined) {
            return []
        }
        const years = range(minYear, maxYear + 1)
        return years.map(y => y.toString())
    },
    formatColumnId: ({ columnId }) => columnId,
    formatValue: (value, _question, chartState) =>
        chartState.mode === ModesEnum.VALUE ? formatPercentage(value) : `#${value + 1}`,
    getPointValue: (point, chartState) =>
        chartState.mode === ModesEnum.VALUE
            ? Math.floor((point?.ratios?.[chartState.view] || 0) * 100)
            : point.rank - 1
}
