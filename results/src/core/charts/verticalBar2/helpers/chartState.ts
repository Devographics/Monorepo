import { useState } from 'react'
import { ColumnModes } from '../../common2/types'
import { VerticalBarChartState, Views } from '../types'
import { BlockVariantDefinition } from 'core/types'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    const defaultState = {} as VerticalBarChartState
    if (block.defaultView) {
        defaultState.view = block.defaultView
    } else {
        defaultState.view = Views.AVERAGE
    }
    return defaultState
}

export const useChartState = (defaultState: {
    [P in keyof VerticalBarChartState]?: VerticalBarChartState[P]
}) => {
    const [facet, setFacet] = useState<VerticalBarChartState['facet']>(defaultState.facet)
    const [view, setView] = useState<VerticalBarChartState['view']>(
        defaultState.view || Views.COUNT
    )
    const [columnMode, setColumnMode] = useState<VerticalBarChartState['columnMode']>(
        defaultState.columnMode || ColumnModes.STACKED
    )

    const chartState: VerticalBarChartState = {
        facet,
        setFacet,
        view,
        setView,
        columnMode,
        setColumnMode
    }
    return chartState
}
