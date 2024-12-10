import { useState } from 'react'
import { QuestionMetadata } from '@devographics/types'
import { ColumnModes, OrderOptions } from '../../common2/types'
import { HorizontalBarChartState, HorizontalBarViews } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { getViewDefinition } from './views'

export const getDefaultState = ({
    facetQuestion,
    block
}: {
    facetQuestion?: QuestionMetadata
    block: BlockVariantDefinition
}) => {
    const defaultState = {} as HorizontalBarChartState

    if (facetQuestion) {
        defaultState.facet = { id: facetQuestion.id, sectionId: facetQuestion.sectionId }
        if (facetQuestion.optionsAreRange || facetQuestion.optionsAreNumeric) {
            defaultState.view = HorizontalBarViews.BOXPLOT
        } else {
            defaultState.view = HorizontalBarViews.PERCENTAGE_BUCKET
        }
    } else {
        defaultState.view = block.defaultView ?? HorizontalBarViews.PERCENTAGE_QUESTION
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
        setRowsLimit
    }
    return chartState
}
