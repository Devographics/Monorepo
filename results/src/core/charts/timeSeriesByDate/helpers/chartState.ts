import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { VerticalBarChartState, VerticalBarViewsEnum } from 'core/charts/verticalBar2/types'
import { QuestionMetadata } from '@devographics/types'

export const getDefaultState = ({
    facetQuestion,
    block
}: {
    facetQuestion?: QuestionMetadata
    block: BlockVariantDefinition
}) => {
    const defaultState = {} as VerticalBarChartState
    if (facetQuestion) {
        defaultState.facetQuestion = facetQuestion
        defaultState.view = VerticalBarViewsEnum.COUNT_STACKED_BAR
    } else {
        defaultState.view = block.defaultView ?? VerticalBarViewsEnum.COUNT_BAR
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
        ...defaultState,
        view,
        setView,
        highlighted,
        setHighlighted
    }
    return chartState
}
