import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { BaselineStatuses, FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { CellDimension } from './types'
import {
    applyRatio,
    applyRowsLimit,
    combineItems,
    getCellDimensions,
    getItemTotals,
    getMaxValues,
    getRowOffset,
    sortBuckets,
    sortItems
} from './helpers/helpers'
import { MultiItemsRow } from './MultiItemsRow'
import Rows from '../horizontalBar2/rows/Rows'
import min from 'lodash/min'
import max from 'lodash/max'
import take from 'lodash/take'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
// import { getViewComponent } from './helpers/views'
// import { useChartValues } from './helpers/chartValues'
// import { MultiRatioSerie, VerticalBarChartState } from './types'
import { MultiItemSerie, MultiItemsChartState } from './types'
import { getItemFilters } from '../common2/helpers'
import { NoData } from '../common2/NoData'
import { useChartValues } from './helpers/chartValues'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const allColumnIds = [
    ...Object.values(FeaturesOptions),
    ...Object.values(SimplifiedSentimentOptions)
]

export const MultiItemsSerie = (
    props: {
        serie: MultiItemSerie
        serieIndex: number
    } & CommonProps<MultiItemsChartState>
) => {
    const { serie, chartState, question, variant, block, serieIndex, viewDefinition } = props
    const items = serie.data

    if (!items) {
        console.log(serie)
        return <NoData />
    }
    const { grouping, variable, sort, order, filter } = chartState

    const columnIds = sortOptions[grouping]

    // combine/flatten each item's buckets
    let combinedItems = combineItems({ items, variable })

    // filter items if needed
    if (filter) {
        if (Object.values(BaselineStatuses).includes(filter as BaselineStatuses)) {
            // we are filtering based on a baseline status
            if (filter === BaselineStatuses.UNKNOWN) {
                combinedItems = combinedItems.filter(
                    item => item?.entity?.webFeature?.status?.baseline === undefined
                )
            } else {
                combinedItems = combinedItems.filter(
                    item => item?.entity?.webFeature?.status?.baseline === filter
                )
            }
        } else {
            // we are filtering based on a section id
            combinedItems = combinedItems.filter(item => item._metadata.sectionId === filter)
        }
    }

    // get column-by-column grouped totals
    const groupedTotals = getItemTotals({ combinedItems, columnIds: allColumnIds })

    // get max value among all items for each column
    const maxValues = getMaxValues({ groupedTotals, columnIds })

    // sort items according to grouped totals
    combinedItems = sortItems({ combinedItems, groupedTotals, sort, order })

    const chartValues = useChartValues({ items: combinedItems, chartState, question })

    if (applyRowsLimit(chartState.rowsLimit, combinedItems.length)) {
        combinedItems = take(combinedItems, chartState.rowsLimit)
    }

    let allRowsCellDimensions = combinedItems.map(item =>
        getCellDimensions({
            buckets: sortBuckets(item.combinedBuckets, grouping),
            chartState
        })
    )

    let allRowsOffsets = allRowsCellDimensions.map(cd =>
        getRowOffset({
            firstRowCellDimensions: allRowsCellDimensions[0],
            cellDimensions: cd,
            chartState
        })
    )

    // offseting row will make the entire chart expand past 100%
    // shrink it down to 100% again
    // note: offsets can be positive (offset to the left) or negative (offset to the right)
    const largestNegativeOffset = min(allRowsOffsets.filter(o => o < 0)) || 0
    const largestPositiveOffset = max(allRowsOffsets.filter(o => o > 0)) || 0

    const totalWidthWithOffset = Math.abs(largestNegativeOffset) + largestPositiveOffset + 100
    const rowOffsetShrinkRatio = 100 / totalWidthWithOffset
    allRowsCellDimensions = allRowsCellDimensions.map(cd =>
        applyRatio<CellDimension>(cd, rowOffsetShrinkRatio)
    )
    // note: up to now we have only calculated offsets relative to the first row
    // but the first row may itself need to be offseted. In this case
    // subract additional largestPositiveOffset to all offsets
    allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset - largestPositiveOffset)
    // finally, apply shrinking ratio
    allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset * rowOffsetShrinkRatio)

    const commonProps = {
        items: combinedItems,
        chartState,
        maxValues,
        chartValues,
        block,
        allRowsCellDimensions,
        allRowOffsets: allRowsOffsets,
        viewDefinition
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    return (
        <GridItem<MultiItemSerie>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <Rows {...commonProps}>
                {combinedItems.map((item, i) => (
                    <MultiItemsRow key={item.id + i} rowIndex={i} item={item} {...commonProps} />
                ))}
            </Rows>
        </GridItem>
    )
}

export default MultiItemsSerie
