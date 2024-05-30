import { VerticalBarViewDefinition, VerticalBarViews } from '../../verticalBar2/types'
import { Average, PercentageQuestion } from '../views'

export const viewDefinitions: { [key: string]: VerticalBarViewDefinition } = {
    // regular views
    [VerticalBarViews.PERCENTAGE_QUESTION]: PercentageQuestion,
    // [VerticalBarViews.COUNT]: Count,
    // faceted views
    [VerticalBarViews.AVERAGE]: Average
    // [Views.FACET_COUNTS]: FacetCounts,
    // [Views.PERCENTAGE_BUCKET]: PercentageBucket
}

export const getViewComponent = (view: VerticalBarViews) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: VerticalBarViews) => {
    return viewDefinitions[view]
}
