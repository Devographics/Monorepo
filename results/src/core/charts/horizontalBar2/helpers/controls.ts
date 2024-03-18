import { ChartState, Control, Views } from '../types'
import { Bars, Boxplot } from 'core/icons'
import { ChartValues } from '../../multiItemsExperience/types'

const controlIcons = {
    [Views.BOXPLOT]: Boxplot,
    [Views.AVERAGE]: Bars,
    [Views.COUNT]: Bars,
    [Views.PERCENTAGE_BUCKET]: Bars,
    [Views.PERCENTAGE_QUESTION]: Bars
}

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
            ? [Views.BOXPLOT, Views.AVERAGE, Views.PERCENTAGE_BUCKET, Views.COUNT]
            : [Views.PERCENTAGE_BUCKET, Views.COUNT]
        : [Views.PERCENTAGE_QUESTION, Views.COUNT]
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
