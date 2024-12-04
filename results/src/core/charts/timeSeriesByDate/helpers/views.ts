import { VerticalBarViewDefinition, VerticalBarViewsEnum } from '../../verticalBar2/types'
import { Count } from '../views'

export const viewDefinitions: { [key: string]: any } = {
    // regular views
    // [VerticalBarViews.PERCENTAGE_QUESTION]: PercentageQuestion,
    [VerticalBarViewsEnum.COUNT]: Count
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
        throw new Error(`getViewDefinition: could not find view definition for view ${view}`)
    }
    return viewDefinition
}
