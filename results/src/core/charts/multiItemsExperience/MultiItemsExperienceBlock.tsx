import React, { useState } from 'react'
import './MultiItemsExperience.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsExperienceControls'
import {
    ChartState,
    ColumnModes,
    DEFAULT_VARIABLE,
    GroupingOptions,
    MultiItemsExperienceBlockProps,
    OrderOptions
} from './types'
import { combineItems, getItemTotals, getMaxValues, sortItems } from './helpers'
import { Row } from './MultiItemsExperienceRow'
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
    const [columnMode, setColumnMode] = useState<ChartState['columnMode']>(ColumnModes.STACKED)
    const [facetId, setFacetId] = useState<ChartState['facetId']>('sentiment')

    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

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

    return (
        <div className={className}>
            <MultiItemsExperienceControls chartState={chartState} />
            <div className="multiexp-rows" ref={parent}>
                {sortedItems.map((item, i) => (
                    <Row key={item.id} item={item} maxValues={maxValues} chartState={chartState} />
                ))}
            </div>
        </div>
    )
}

export default MultiItemsExperienceBlock
