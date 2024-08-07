import { Bucket, QuestionMetadata } from '@devographics/types'
import { HorizontalBarChartState, HorizontalBarChartValues, HorizontalBarViews } from '../types'
import max from 'lodash/max'
import { BlockVariantDefinition } from 'core/types'
import { useAllQuestionsWithOptions } from '../../hooks'

export const useChartValues = ({
    buckets,
    chartState,
    block,
    question
}: {
    buckets: Bucket[]
    chartState: HorizontalBarChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const { viewDefinition } = chartState
    const { getValue, getTicks } = viewDefinition
    const allQuestions = useAllQuestionsWithOptions()
    const values = buckets.map(b => getValue(b))
    const { facet } = chartState
    const chartValues: HorizontalBarChartValues = {
        question,
        totalRows: buckets.length
    }

    const maxOverallValue = [HorizontalBarViews.PERCENTAGE_BUCKET].includes(chartState.view)
        ? 100
        : max(values) || 0

    chartValues.maxOverallValue = maxOverallValue

    if (getTicks) {
        chartValues.ticks = getTicks(values)
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
