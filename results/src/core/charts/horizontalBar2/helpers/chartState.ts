import { useState } from 'react'
import { QuestionMetadata, sortProperties } from '@devographics/types'
import { ColumnModes, NestedEnum, OrderOptions } from '../../common2/types'
import { HorizontalBarChartState, HorizontalBarViews } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { getChartView, getViewDefinition } from './views'

export const getDefaultState = ({
    facetQuestion,
    block
}: {
    facetQuestion?: QuestionMetadata & { sectionIdOverride?: string }
    block: BlockVariantDefinition
}) => {
    const defaultState = {} as HorizontalBarChartState

    defaultState.view = getChartView({ facetQuestion, block })
    if (facetQuestion) {
        defaultState.facet = {
            id: facetQuestion.id,
            sectionId: facetQuestion.sectionId,
            sectionIdOverride: facetQuestion.sectionIdOverride
        }
        defaultState.columnMode = ColumnModes.STACKED
    } else {
        defaultState.columnMode = ColumnModes.REGULAR
    }
    if (block?.chartOptions?.limit) {
        defaultState.rowsLimit = block.chartOptions.limit
    }
    if (block?.filtersState?.options?.sort) {
        defaultState.sort = block?.filtersState?.options?.sort
    }
    if (block?.filtersState?.options?.order) {
        defaultState.order = block?.filtersState?.options?.order
    }
    if (block?.variables?.defaultNested) {
        defaultState.nested = block?.variables?.defaultNested
    }
    return defaultState
}

export const useChartState = (defaultState: {
    [P in keyof HorizontalBarChartState]?: HorizontalBarChartState[P]
}) => {
    const [rowsLimit, setRowsLimit] = useState<HorizontalBarChartState['rowsLimit']>(
        defaultState?.rowsLimit || 0
    )
    const [sort, setSort] = useState<HorizontalBarChartState['sort']>(defaultState.sort)
    const [order, setOrder] = useState<HorizontalBarChartState['order']>(
        defaultState.order || OrderOptions.DESC
    )
    const [view, setView] = useState<HorizontalBarChartState['view']>(
        defaultState.view || HorizontalBarViews.COUNT
    )
    const [columnMode, setColumnMode] = useState<HorizontalBarChartState['columnMode']>(
        defaultState.columnMode || ColumnModes.STACKED
    )
    const [highlightedRow, setHighlightedRow] =
        useState<HorizontalBarChartState['highlightedRow']>(null)

    const [highlightedCell, setHighlightedCell] =
        useState<HorizontalBarChartState['highlightedCell']>(null)

    const [nested, setNested] = useState<HorizontalBarChartState['nested']>(
        defaultState.nested || NestedEnum.NESTED
    )
    const viewDefinition = getViewDefinition(view)

    const chartState: HorizontalBarChartState = {
        facet: defaultState.facet,
        sort,
        setSort,
        order,
        setOrder,
        view,
        setView,
        viewDefinition,
        columnMode,
        setColumnMode,
        rowsLimit,
        setRowsLimit,
        highlightedRow,
        setHighlightedRow,
        highlightedCell,
        setHighlightedCell,
        nested,
        setNested
    }
    return chartState
}
