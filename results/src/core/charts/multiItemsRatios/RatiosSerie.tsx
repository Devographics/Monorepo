import React from 'react'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
// import { getViewComponent } from './helpers/views'
// import { useChartValues } from './helpers/chartValues'
// import { MultiRatioSerie, VerticalBarChartState } from './types'
import { getItemFilters } from '../common2/helpers/filters'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { MultiRatioSerie, MultiRatiosChartState, Ratios } from './types'
import { useChartValues } from './helpers/chartValues'
import { ColumnEmpty } from '../verticalBar2/columns/ColumnEmpty'
import { LineItem } from '../verticalBar2/types'
import { StandardQuestionData } from '@devographics/types'
import { getEditionByYear } from '../verticalBar2/helpers/other'
import sortBy from 'lodash/sortBy'
import { LegendItem } from './Legend-old'
import { getAllEditions } from './helpers/other'

/*



*/
const getItemsWithRank = (items: StandardQuestionData[], view: Ratios) => {
    const itemsWithRank: LineItem[] = items.map(item => ({
        ...item,
        editions: getAllEditions(item).map(edition => {
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
            return { ...edition, rank, value: edition?.ratios?.[view] }
        })
    }))
    return itemsWithRank
}

export const RatiosSerie = (
    props: {
        legendItems: LegendItem[]
        serie: MultiRatioSerie
        serieIndex: number
    } & CommonProps<MultiRatiosChartState>
) => {
    const { serie, serieIndex, block, chartState, variant, question, legendItems } = props
    const items = serie.data
    const chartValues = useChartValues({ items, chartState, block, question, legendItems })

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const commonProps = { block, chartState, chartValues }
    const { years } = chartValues
    const { view } = chartState

    const itemsWithRank = getItemsWithRank(items, view)

    return (
        <GridItem<MultiRatioSerie>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <Columns {...commonProps} hasZebra={true}>
                <>
                    {/* {props.editions.map((edition, i) => (
                        <ColumnSingle
                            columnIndex={i}
                            {...props}
                            key={edition.editionId}
                            edition={edition}
                            showCount={false}
                            showBar={false}
                        />
                    ))} */}
                    {years.map((year, i) => (
                        <ColumnEmpty
                            {...props}
                            chartValues={chartValues}
                            columnIndex={i}
                            key={year}
                            year={year}
                        />
                    ))}
                    <Lines {...commonProps} items={itemsWithRank} />
                </>
            </Columns>

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </GridItem>
    )
}

export default RatiosSerie
