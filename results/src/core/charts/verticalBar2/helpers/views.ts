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
    // define dummy getValue and formatValue which will be overwritten
    const getValue = () => 0
    const formatValue = (v: number) => v.toString()
    return { getValue, formatValue, ...viewDefinitions[view] }
}
