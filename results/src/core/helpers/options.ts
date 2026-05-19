import { NO_ANSWER } from '@devographics/constants'
import { isFeatureTemplate, isToolTemplate } from '@devographics/helpers'
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

export const useAllQuestions = () => {
    const pageContext = usePageContext()
    const { currentEdition } = pageContext
    return getAllQuestions(currentEdition)
}

export const getQuestionById = (edition: EditionMetadata, id: string) => {
    const allQuestions = getAllQuestions(edition)
    return allQuestions.find(question => question.id === id)
}

export const useQuestionById = (id: string) => {
    const allQuestions = useAllQuestions()
    return allQuestions.find(question => question.id === id)
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
    } else if (isToolTemplate(question.template)) {
        return Object.values(ToolsOptions)
    } else if (isFeatureTemplate(question.template)) {
        return Object.values(FeaturesOptions)
    } else {
        return
    }
}
