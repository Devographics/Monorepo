import { Bucket, QuestionMetadata } from '@devographics/types'
import { ChartState } from '../types'
import { ChartValues } from '../../multiItemsExperience/types'
import max from 'lodash/max'
import { BlockDefinition } from 'core/types'
import { useAllQuestionsWithOptions } from '../../hooks'
import { getIsPercentage, getValue } from './other'

export const useChartValues = ({
    buckets,
    chartState,
    block,
    question
}: {
    buckets: Bucket[]
    chartState: ChartState
    block: BlockDefinition
    question: QuestionMetadata
}) => {
    const allQuestions = useAllQuestionsWithOptions()
    const { facet } = chartState
    const isPercentage = getIsPercentage(chartState)
    const maxOverallValue = isPercentage ? 100 : max(buckets.map(b => getValue(b, chartState))) || 0

    const chartValues: ChartValues = {
        maxOverallValue,
        question
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
