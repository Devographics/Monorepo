import { useState } from 'react'

import { QuestionMetadata } from '@devographics/types'
import { ColumnModes, OrderOptions } from '../../common2/types'
import { ChartState, Views } from '../types'

export const useChartState = ({ facetQuestion }: { facetQuestion?: QuestionMetadata }) => {
    const defaultState = {} as ChartState
    if (facetQuestion) {
        defaultState.facet = { id: facetQuestion.id, sectionId: facetQuestion.sectionId }
        if (facetQuestion.optionsAreSequential) {
            defaultState.view = Views.PERCENTAGE_BUCKET
        } else {
            defaultState.view = Views.PERCENTAGE_BUCKET
        }
    } else {
        defaultState.view = Views.PERCENTAGE_QUESTION
    }

    const [facet, setFacet] = useState<ChartState['facet']>(defaultState.facet)
    const [sort, setSort] = useState<ChartState['sort']>(defaultState.sort)
    const [order, setOrder] = useState<ChartState['order']>(defaultState.order || OrderOptions.DESC)
    const [view, setView] = useState<ChartState['view']>(defaultState.view || Views.COUNT)
    const [columnMode, setColumnMode] = useState<ChartState['columnMode']>(
        defaultState.columnMode || ColumnModes.STACKED
    )

    const chartState: ChartState = {
        facet,
        setFacet,
        sort,
        setSort,
        order,
        setOrder,
        view,
        setView,
        columnMode,
        setColumnMode
    }
    return chartState
}
