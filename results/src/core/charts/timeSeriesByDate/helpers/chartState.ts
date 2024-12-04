import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { VerticalBarChartState, VerticalBarViewsEnum } from 'core/charts/verticalBar2/types'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    const defaultState = {} as VerticalBarChartState
    if (block.defaultView) {
        defaultState.view = block.defaultView
    } else {
        defaultState.view = VerticalBarViewsEnum.COUNT
    }
    return defaultState
}

export const useChartState = (defaultState: {
    [P in keyof VerticalBarChartState]?: VerticalBarChartState[P]
}) => {
    const [view, setView] = useState<VerticalBarChartState['view']>(
        defaultState.view || VerticalBarViewsEnum.COUNT
    )
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const chartState: VerticalBarChartState = {
        view,
        setView,
        highlighted,
        setHighlighted
    }
    return chartState
}
