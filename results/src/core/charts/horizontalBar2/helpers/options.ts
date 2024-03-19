import { NOT_APPLICABLE, NO_ANSWER } from '@devographics/constants'
import { QuestionMetadata } from '@devographics/types'
import { ChartState } from '../types'

export const getQuestionOptions = ({
    question,
    chartState
}: {
    question: QuestionMetadata
    chartState: ChartState
}) => {
    if (!question.options) {
        return []
    } else {
        return [...question.options, { id: NO_ANSWER }]
    }
}
