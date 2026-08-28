import {
    Bucket,
    QuestionMetadata,
    ResponseEditionMetadata,
    StandardQuestionData
} from '@devographics/types'
import {
    HorizontalBarChartState,
    HorizontalBarChartValues,
    HorizontalBarViewDefinition
} from '../types'
import { useAllQuestions, useAllQuestionsWithOptions } from '../../hooks'
import { SerieMetadataProps, SeriesMetadata } from 'core/charts/common2/types'
import { getMaxValue } from './other'
import { DataSeries } from 'core/filters/types'

export const useChartValues = ({
    buckets,
    chartState,
    question,
    seriesMetadata,
    serie,
    serieMetadata,
    serieMetadataProps,
    viewDefinition,
    contentWidth
}: {
    buckets: Bucket[]
    chartState: HorizontalBarChartState
    question: QuestionMetadata
    seriesMetadata: SeriesMetadata
    serie: DataSeries<StandardQuestionData>
    serieMetadata: ResponseEditionMetadata
    serieMetadataProps: SerieMetadataProps
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    contentWidth?: number
}) => {
    const { view } = chartState
    const { getValue, getTicks } = viewDefinition
    const allQuestions = useAllQuestions()
    const values = buckets.map(getValue)
    const { facet } = chartState
    const chartValues: HorizontalBarChartValues = {
        question,
        totalRows: buckets.length,
        totalRespondents: seriesMetadata.totalRespondents,
        totalResponses: seriesMetadata.totalResponses,
        serieMetadata,
        serieMetadataProps
    }
    const maxOverallValue = seriesMetadata.seriesMaxValue || getMaxValue({ values, view })

    chartValues.maxOverallValue = maxOverallValue

    if (serie.data._correlations) {
        chartValues._correlations = serie.data._correlations
    }

    if (getTicks) {
        chartValues.ticks = getTicks({
            maxValue: maxOverallValue,
            contentWidth,
            buckets,
            seriesMetadata
        })
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
