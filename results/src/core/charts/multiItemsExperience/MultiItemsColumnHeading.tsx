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

export const ColumnHeading = ({
    columnId,
    width,
    offset,
    chartState
}: {
    columnId: ColumnId
    width: number
    offset: number
    chartState: ChartState
}) => {
    const { sort, setSort, order, setOrder } = chartState
    const style = {
        '--width': width,
        '--offset': offset
    }
    const isEnabled = sort === columnId
    return (
        <div className="multiexp-column-heading" style={style}>
            <h3>{columnId}</h3>
            <button
                className={`column-heading-sort column-heading-order-${order} ${
                    isEnabled ? 'column-heading-sort-enabled' : ''
                }`}
                onClick={e => {
                    e.preventDefault()
                    if (isEnabled) {
                        setOrder(order === OrderOptions.ASC ? OrderOptions.DESC : OrderOptions.ASC)
                    } else {
                        setSort(columnId)
                    }
                }}
            >
                <span className="order-asc">↑</span>
                <span className="order-desc">↓</span>
            </button>
        </div>
    )
}
