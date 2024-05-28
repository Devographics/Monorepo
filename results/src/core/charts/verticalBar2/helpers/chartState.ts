import { useState } from 'react'

import { QuestionMetadata } from '@devographics/types'
import { ColumnModes, OrderOptions } from '../../common2/types'
import { ChartState, Views } from '../types'
import { BlockVariantDefinition } from 'core/types'

export const getDefaultState = ({
    facetQuestion,
    block
}: {
    facetQuestion?: QuestionMetadata
    block: BlockVariantDefinition
}) => {
    const defaultState = {} as ChartState
    if (block.defaultView) {
        defaultState.view = block.defaultView
    } else {
        if (facetQuestion) {
            defaultState.facet = { id: facetQuestion.id, sectionId: facetQuestion.sectionId }
            defaultState.view = Views.PERCENTAGE_BUCKET
        } else {
            defaultState.view = Views.AVERAGE
        }
    }
    return defaultState
}

export const useChartState = (defaultState: { [P in keyof ChartState]?: ChartState[P] }) => {
    const [facet, setFacet] = useState<ChartState['facet']>(defaultState.facet)
    const [view, setView] = useState<ChartState['view']>(defaultState.view || Views.COUNT)
    const [columnMode, setColumnMode] = useState<ChartState['columnMode']>(
        defaultState.columnMode || ColumnModes.STACKED
    )

    const chartState: ChartState = {
        facet,
        setFacet,
        view,
        setView,
        columnMode,
        setColumnMode
    }
    return chartState
}
