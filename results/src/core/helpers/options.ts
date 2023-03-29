import { Edition, Question, Option, ToolsOptions, FeaturesOptions } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'

export const getAllQuestions = (edition: Edition) => {
    const { sections } = edition
    const allQuestions = sections.map(s => s.questions).flat()
    return allQuestions
}

export const useOptions = (questionId: string) => {
    const context = usePageContext()
    const { currentEdition } = context
    const allQuestions = getAllQuestions(currentEdition)
    const question = allQuestions.find((q: Question) => q.id === questionId)
    if (!question) {
        return []
    }
    if (question.options) {
        return question.options.map((o: Option) => o.id)
    } else if (question.template === 'tool') {
        return Object.values(ToolsOptions)
    } else if (question.template === 'feature') {
        return Object.values(FeaturesOptions)
    } else {
        return
    }
}
