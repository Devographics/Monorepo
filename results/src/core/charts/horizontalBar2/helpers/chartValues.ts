import { Bucket, QuestionMetadata } from '@devographics/types'
import { HorizontalBarChartState, HorizontalBarChartValues, HorizontalBarViews } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { useAllQuestionsWithOptions } from '../../hooks'
import { CommonProps, SeriesMetadata } from 'core/charts/common2/types'
import { getMaxValue } from './other'

export const useChartValues = ({
    buckets,
    chartState,
    question,
    seriesMetadata
}: {
    buckets: Bucket[]
    chartState: HorizontalBarChartState
    question: QuestionMetadata
    seriesMetadata: SeriesMetadata
}) => {
    const { viewDefinition } = chartState
    const { getValue, getTicks } = viewDefinition
    const allQuestions = useAllQuestionsWithOptions()
    const values = buckets.map(getValue)
    const { facet } = chartState
    const chartValues: HorizontalBarChartValues = {
        question,
        totalRows: buckets.length
    }

    const view = chartState.view as HorizontalBarViews
    const maxOverallValue = seriesMetadata.seriesMaxValue || getMaxValue({ values, view })

    chartValues.maxOverallValue = maxOverallValue

    if (getTicks) {
        chartValues.ticks = getTicks(maxOverallValue)
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
