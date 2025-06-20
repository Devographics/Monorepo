import { Bucket, QuestionMetadata, ResponseEditionMetadata } from '@devographics/types'
import {
    HorizontalBarChartState,
    HorizontalBarChartValues,
    HorizontalBarViewDefinition
} from '../types'
import { useAllQuestions, useAllQuestionsWithOptions } from '../../hooks'
import { SerieMetadataProps, SeriesMetadata } from 'core/charts/common2/types'
import { getMaxValue } from './other'

export const useChartValues = ({
    buckets,
    chartState,
    question,
    seriesMetadata,
    serieMetadata,
    serieMetadataProps,
    viewDefinition
}: {
    buckets: Bucket[]
    chartState: HorizontalBarChartState
    question: QuestionMetadata
    seriesMetadata: SeriesMetadata
    serieMetadata: ResponseEditionMetadata
    serieMetadataProps: SerieMetadataProps
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
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
