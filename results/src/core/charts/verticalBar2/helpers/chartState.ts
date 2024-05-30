import { useState } from 'react'
import { VerticalBarChartState, VerticalBarViews } from '../types'
import { BlockVariantDefinition } from 'core/types'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    const defaultState = {} as VerticalBarChartState
    if (block.defaultView) {
        defaultState.view = block.defaultView
    } else {
        defaultState.view = VerticalBarViews.AVERAGE
    }
    return defaultState
}

export const useChartState = (defaultState: {
    [P in keyof VerticalBarChartState]?: VerticalBarChartState[P]
}) => {
    const [view, setView] = useState<VerticalBarChartState['view']>(
        defaultState.view || VerticalBarViews.AVERAGE
    )

    const chartState: VerticalBarChartState = {
        view,
        setView
    }
    return chartState
}
