import { ChartState, Control, Views } from '../types'
import { Bars, FacetBars, Boxplot as BoxplotIcon } from 'core/icons'
import { ChartValues } from '../../multiItemsExperience/types'
import {
    Average,
    Boxplot,
    Count,
    PercentageBucket,
    PercentageQuestion,
    FacetCounts
} from '../views'

const controlIcons = {
    [Views.BOXPLOT]: BoxplotIcon,
    [Views.AVERAGE]: Bars,
    [Views.FACET_COUNTS]: FacetBars,
    [Views.COUNT]: Bars,
    [Views.PERCENTAGE_BUCKET]: FacetBars,
    [Views.PERCENTAGE_QUESTION]: Bars
}

// TODO: put this together with view definition
export const getControls = ({
    chartState,
    chartValues
}: {
    chartState: ChartState
    chartValues: ChartValues
}) => {
    const { view, setView } = chartState
    const { facetQuestion } = chartValues
    const views = facetQuestion
        ? facetQuestion.optionsAreSequential
            ? [Views.BOXPLOT, Views.AVERAGE, Views.PERCENTAGE_BUCKET, Views.FACET_COUNTS]
            : [Views.PERCENTAGE_BUCKET, Views.FACET_COUNTS]
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

const viewComponents = {
    // regular views
    [Views.PERCENTAGE_QUESTION]: PercentageQuestion,
    [Views.COUNT]: Count,
    // faceted views
    [Views.AVERAGE]: Average,
    [Views.BOXPLOT]: Boxplot,
    [Views.FACET_COUNTS]: FacetCounts,
    [Views.PERCENTAGE_BUCKET]: PercentageBucket
}

export const getViewComponent = (view: Views) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: Views) => {
    return viewComponents[view]
}
