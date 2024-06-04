import { NOT_APPLICABLE, NO_ANSWER } from '@devographics/constants'
import { QuestionMetadata } from '@devographics/types'
import { HorizontalBarChartState } from '../types'

export const getQuestionOptions = ({
    question,
    chartState
}: {
    question: QuestionMetadata
    chartState: HorizontalBarChartState
}) => {
    if (!question.options) {
        return []
    } else {
        return [...question.options, { id: NO_ANSWER }]
    }
}
