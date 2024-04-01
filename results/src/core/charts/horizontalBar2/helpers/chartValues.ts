import { Bucket, QuestionMetadata } from '@devographics/types'
import { ChartState, Views } from '../types'
import { ChartValues } from '../../multiItemsExperience/types'
import max from 'lodash/max'
import { BlockVariantDefinition } from 'core/types'
import { useAllQuestionsWithOptions } from '../../hooks'
import { getViewDefinition } from './views'

export const useChartValues = ({
    buckets,
    chartState,
    block,
    question
}: {
    buckets: Bucket[]
    chartState: ChartState
    block: BlockVariantDefinition
    question: QuestionMetadata
}) => {
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const allQuestions = useAllQuestionsWithOptions()
    const { facet } = chartState
    const chartValues: ChartValues = {
        question
    }
    if (getValue) {
        const maxOverallValue = [Views.PERCENTAGE_BUCKET].includes(chartState.view)
            ? 100
            : max(buckets.map(b => getValue(b))) || 0

        chartValues.maxOverallValue = maxOverallValue
    }
    if (facet) {
        chartValues.facetQuestion = allQuestions.find(
            q => q.sectionId === facet.sectionId && q.id === facet.id
        )
    }
    return chartValues
}
