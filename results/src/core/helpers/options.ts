import { Edition, Question, Option } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'

export const getAllQuestions = (edition: Edition) => {
    const { sections } = edition
    const allQuestions = sections.map(s => s.questions).flat()
    return allQuestions
}

export const useOptions = (questionId: string) => {
    const context = usePageContext()
    const { currentEdition } = context
    console.log(currentEdition)
    const allQuestions = getAllQuestions(currentEdition)
    const question = allQuestions.find((q: Question) => q.id === questionId)
    if (!question) {
        return []
    }
    const optionsIds = question.options.map((o: Option) => o.id)
    return optionsIds
}
