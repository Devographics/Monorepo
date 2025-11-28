import { FeaturesOptions, OrderOptions } from '@devographics/types'
import { MultiItemsChartState, DEFAULT_VARIABLE, GroupingOptions } from '../types'
import { useState } from 'react'
import { ColumnModes } from '../../common2/types'

export const useChartState = (defaultState?: {
    [P in keyof MultiItemsChartState]?: MultiItemsChartState[P]
}) => {
    const [rowsLimit, setRowsLimit] = useState<MultiItemsChartState['rowsLimit']>(
        defaultState?.rowsLimit || 0
    )
    const [grouping, setGrouping] = useState<MultiItemsChartState['grouping']>(
        GroupingOptions.EXPERIENCE
    )
    const [sort, setSort] = useState<MultiItemsChartState['sort']>(FeaturesOptions.USED)
    const [filter, setFilter] = useState<MultiItemsChartState['filter']>()
    const [order, setOrder] = useState<MultiItemsChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<MultiItemsChartState['variable']>(DEFAULT_VARIABLE)
    const [highlightedRow, setHighlightedRow] =
        useState<MultiItemsChartState['highlightedRow']>(null)
    const [columnMode, setColumnMode] = useState<MultiItemsChartState['columnMode']>(
        ColumnModes.STACKED
    )
    const [facetId, setFacetId] = useState<MultiItemsChartState['facetId']>('sentiment')

    const chartState: MultiItemsChartState = {
        facetId,
        setFacetId,
        grouping,
        setGrouping,
        sort,
        setSort,
        filter,
        setFilter,
        order,
        setOrder,
        variable,
        setVariable,
        columnMode,
        setColumnMode,
        rowsLimit,
        setRowsLimit,
        highlightedRow,
        setHighlightedRow
    }
    return chartState
}
