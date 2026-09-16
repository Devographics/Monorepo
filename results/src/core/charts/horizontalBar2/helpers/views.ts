import {
    HorizontalBarChartState,
    Control,
    HorizontalBarViewDefinition,
    HorizontalBarChartValues,
    HorizontalBarViews
} from '../types'
import { Bars, FacetBars, Boxplot as BoxplotIcon, FacetCountsBars } from '@devographics/icons'
import {
    Average,
    BoxplotMedian,
    Count,
    PercentageBucket,
    PercentageQuestion,
    FacetCounts,
    PercentageSurvey,
    BoxplotAverage
} from '../views'
import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

const controlIcons = {
    [HorizontalBarViews.BOXPLOT]: BoxplotIcon,
    [HorizontalBarViews.AVERAGE]: Bars,
    [HorizontalBarViews.FACET_COUNTS]: FacetCountsBars,
    [HorizontalBarViews.COUNT]: Bars,
    [HorizontalBarViews.PERCENTAGE_BUCKET]: FacetBars,
    [HorizontalBarViews.PERCENTAGE_QUESTION]: Bars
}

export const viewDefinitions: { [key: string]: HorizontalBarViewDefinition } = {
    // regular views
    [HorizontalBarViews.PERCENTAGE_QUESTION]: PercentageQuestion,
    [HorizontalBarViews.PERCENTAGE_SURVEY]: PercentageSurvey,
    [HorizontalBarViews.COUNT]: Count,
    // faceted views
    // note: we use the boxplot component for the average view as well
    [HorizontalBarViews.AVERAGE]: BoxplotAverage,
    [HorizontalBarViews.BOXPLOT]: BoxplotMedian,
    [HorizontalBarViews.FACET_COUNTS]: FacetCounts,
    [HorizontalBarViews.PERCENTAGE_BUCKET]: PercentageBucket
}

export const getViewComponent = (view: HorizontalBarViews) => {
    return getViewDefinition(view).component
}

export const getViewDefinition = (view: HorizontalBarViews) => {
    return viewDefinitions[view]
}

export const getChartView = ({
    facetQuestion,
    block
}: {
    facetQuestion?: QuestionMetadata
    block: BlockVariantDefinition
}) => {
    let view = HorizontalBarViews.PERCENTAGE_QUESTION
    const defaultView = block?.chartOptions?.defaultView || block.defaultView
    if (defaultView) {
        view = defaultView
    } else if (facetQuestion) {
        if (facetQuestion.optionsAreRange || facetQuestion.optionsAreNumeric) {
            view = HorizontalBarViews.BOXPLOT
        } else {
            view = HorizontalBarViews.PERCENTAGE_BUCKET
        }
    }
    return view
}
