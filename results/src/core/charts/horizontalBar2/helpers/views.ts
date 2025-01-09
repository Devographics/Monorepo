import {
    HorizontalBarChartState,
    Control,
    HorizontalBarViewDefinition,
    HorizontalBarChartValues,
    HorizontalBarViews
} from '../types'
import { Bars, FacetBars, Boxplot as BoxplotIcon, FacetCountsBars } from 'core/icons'
import {
    Average,
    Boxplot,
    Count,
    PercentageBucket,
    PercentageQuestion,
    FacetCounts,
    PercentageSurvey
} from '../views'

const controlIcons = {
    [HorizontalBarViews.BOXPLOT]: BoxplotIcon,
    [HorizontalBarViews.AVERAGE]: Bars,
    [HorizontalBarViews.FACET_COUNTS]: FacetCountsBars,
    [HorizontalBarViews.COUNT]: Bars,
    [HorizontalBarViews.PERCENTAGE_BUCKET]: FacetBars,
    [HorizontalBarViews.PERCENTAGE_QUESTION]: Bars
}

// TODO: put this together with view definition
export const getControls = ({
    chartState,
    chartValues
}: {
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
}) => {
    const { view, setView } = chartState
    const { facetQuestion } = chartValues
    const views = facetQuestion
        ? facetQuestion.optionsAreSequential
            ? [
                  HorizontalBarViews.BOXPLOT,
                  HorizontalBarViews.AVERAGE,
                  HorizontalBarViews.PERCENTAGE_BUCKET,
                  HorizontalBarViews.FACET_COUNTS
              ]
            : [HorizontalBarViews.PERCENTAGE_BUCKET, HorizontalBarViews.FACET_COUNTS]
        : []
    const controls: Control[] = views.map(id => ({
        id,
        labelId: `chart_units.${id}`,
        isChecked: view === id,
        icon: controlIcons[id],
        onClick: e => {
            e.preventDefault()
            setView(id)
        }
    }))
    return controls
}

export const viewDefinitions: { [key: string]: HorizontalBarViewDefinition } = {
    // regular views
    [HorizontalBarViews.PERCENTAGE_QUESTION]: PercentageQuestion,
    [HorizontalBarViews.PERCENTAGE_SURVEY]: PercentageSurvey,
    [HorizontalBarViews.COUNT]: Count,
    // faceted views
    [HorizontalBarViews.AVERAGE]: Average,
    [HorizontalBarViews.BOXPLOT]: Boxplot,
    [HorizontalBarViews.FACET_COUNTS]: FacetCounts,
    [HorizontalBarViews.PERCENTAGE_BUCKET]: PercentageBucket
}

export const getViewComponent = (view: HorizontalBarViews) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: HorizontalBarViews) => {
    return viewDefinitions[view]
}
