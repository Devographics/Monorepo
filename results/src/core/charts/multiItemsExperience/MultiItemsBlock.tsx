import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { ColumnModes, MultiItemsExperienceBlockProps } from './types'
import {
    combineItems,
    getColumnDimensions,
    getItemTotals,
    getMaxValues,
    sortItems,
    useChartState
} from './helpers'
import { Row } from './MultiItemsRow'
import { ColumnHeading } from './MultiItemsColumnHeading'
import { useI18n } from '@devographics/react-i18n'
import Rows from '../common2/Rows'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { data } = props
    const { items } = data

    const chartState = useChartState()
    const { columnMode, grouping, variable, sort, order } = chartState

    const { getString } = useI18n()
    const shouldSeparateColumns = columnMode === ColumnModes.SPLIT

    const columnIds = sortOptions[grouping]
    const allColumnIds = [
        ...Object.values(FeaturesOptions),
        ...Object.values(SimplifiedSentimentOptions)
    ]

    const className = `multiexp multiexp-groupedBy-${grouping}`

    // combine/flatten each item's buckets
    const combinedItems = combineItems({ items, variable })

    // get column-by-column grouped totals
    const groupedTotals = getItemTotals({ combinedItems, columnIds: allColumnIds })

    // get max value among all items for each column
    const maxValues = getMaxValues({ groupedTotals, columnIds })

    // sort items according to grouped totals
    const sortedItems = sortItems({ combinedItems, groupedTotals, sort, order })

    const { columnDimensions } = getColumnDimensions({ maxValues, shouldSeparateColumns })

    return (
        <div className={className}>
            <MultiItemsExperienceControls chartState={chartState} />
            <div className={`multiexp-column-headings multiexp-column-headings-${columnMode}`}>
                <h3 className="multiexp-table-grouping">
                    {getString(`charts.group.${grouping}`)?.t}
                </h3>
                <div className="multiexp-column-headings-inner">
                    {columnIds.map(columnId => {
                        const columnDimension = columnDimensions.find(d => d.id === columnId)
                        const { width = 0, offset = 0 } = columnDimension || {}
                        return (
                            <ColumnHeading
                                key={columnId}
                                columnId={columnId}
                                width={width}
                                offset={offset}
                                chartState={chartState}
                            />
                        )
                    })}
                </div>
            </div>
            <Rows>
                {sortedItems.map((item, i) => (
                    <Row key={item.id} item={item} maxValues={maxValues} chartState={chartState} />
                ))}
            </Rows>
        </div>
    )
}

export default MultiItemsExperienceBlock
