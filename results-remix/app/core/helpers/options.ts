import { NO_ANSWER } from '@devographics/constants'
import {
    Edition,
    Question,
    Option,
    ToolsOptions,
    FeaturesOptions,
    EditionMetadata
} from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'

export const getAllQuestions = (edition: EditionMetadata) => {
    const { sections } = edition
    const allQuestions = sections.map(s => s.questions).flat()
    return allQuestions
}

export const useOptions = (questionId: string, addNoAnswer = false) => {
    const context = usePageContext()
    const { currentEdition } = context
    const allQuestions = getAllQuestions(currentEdition)
    const question = allQuestions.find((q: Question) => q.id === questionId)
    if (!question) {
        return []
    }
    if (question.options) {
        const options = question.options.map((o: Option) => o.id)
        return addNoAnswer ? [...options, NO_ANSWER] : options
    } else if (question.template === 'tool') {
        return Object.values(ToolsOptions)
    } else if (question.template === 'feature') {
        return Object.values(FeaturesOptions)
    } else {
        return
    }
}
