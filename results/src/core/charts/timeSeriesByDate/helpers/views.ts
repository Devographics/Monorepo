import { VerticalBarViewDefinition, VerticalBarViewsEnum } from '../../verticalBar2/types'
import { Count } from '../views/Count'
import { CountBar } from '../views/CountBar'
import { CountStackedBar } from '../views/CountStackedBar'

export const viewDefinitions: { [key: string]: any } = {
    // regular views
    // [VerticalBarViews.PERCENTAGE_QUESTION]: PercentageQuestion,
    [VerticalBarViewsEnum.COUNT]: Count,
    [VerticalBarViewsEnum.COUNT_BAR]: CountBar,
    [VerticalBarViewsEnum.COUNT_STACKED_BAR]: CountStackedBar
    // faceted views
    // [VerticalBarViews.AVERAGE]: Average
    // [Views.FACET_COUNTS]: FacetCounts,
    // [Views.PERCENTAGE_BUCKET]: PercentageBucket
}

export const getViewComponent = (view: string) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: string) => {
    const viewDefinition = viewDefinitions[view]
    if (!viewDefinition) {
        throw new Error(
            `timeSeriesByDate/getViewDefinition: could not find view definition for view ${view}`
        )
    }
    return viewDefinition
}
