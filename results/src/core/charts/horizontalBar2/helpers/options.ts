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

export const getQuestionGroups = ({
    question,
    chartState
}: {
    question: QuestionMetadata
    chartState: HorizontalBarChartState
}) => {
    if (!question.groups) {
        return []
    } else {
        return [...question.groups, { id: NO_ANSWER }]
    }
}
