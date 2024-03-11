import React, { useState } from 'react'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import {
    ChartState,
    ColumnId,
    ColumnModes,
    DEFAULT_VARIABLE,
    GroupingOptions,
    MultiItemsExperienceBlockProps,
    OrderOptions
} from './types'
import {
    combineItems,
    getColumnDimensions,
    getItemTotals,
    getMaxValues,
    sortItems
} from './helpers'
import { Row } from './MultiItemsRow'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { data } = props
    const { items } = data
    const [grouping, setGrouping] = useState<ChartState['grouping']>(GroupingOptions.EXPERIENCE)
    const [sort, setSort] = useState<ChartState['sort']>(FeaturesOptions.USED)
    const [order, setOrder] = useState<ChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<ChartState['variable']>(DEFAULT_VARIABLE)
    const [columnMode, setColumnMode] = useState<ChartState['columnMode']>(ColumnModes.SEPARATE)
    const [facetId, setFacetId] = useState<ChartState['facetId']>('sentiment')

    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    const shouldSeparateColumns = columnMode === ColumnModes.SEPARATE

    const columnIds = sortOptions[grouping]
    const allColumnIds = [
        ...Object.values(FeaturesOptions),
        ...Object.values(SimplifiedSentimentOptions)
    ]

    const chartState: ChartState = {
        facetId,
        setFacetId,
        grouping,
        setGrouping,
        sort,
        setSort,
        order,
        setOrder,
        variable,
        setVariable,
        columnMode,
        setColumnMode
    }

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
            <div className="multiexp-column-headings">
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
                            />
                        )
                    })}
                </div>
            </div>
            <div className="multiexp-rows" ref={parent}>
                {sortedItems.map((item, i) => (
                    <Row key={item.id} item={item} maxValues={maxValues} chartState={chartState} />
                ))}
            </div>
        </div>
    )
}

const ColumnHeading = ({
    columnId,
    width,
    offset
}: {
    columnId: ColumnId
    width: number
    offset: number
}) => {
    const style = {
        '--width': width,
        '--offset': offset
    }
    return (
        <div className="multiexp-column-heading" style={style}>
            {columnId}
        </div>
    )
}

export default MultiItemsExperienceBlock
