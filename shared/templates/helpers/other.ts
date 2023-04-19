import { QuestionWithId, TemplateArguments } from '@devographics/types'

export const checkHasId = (options: TemplateArguments) => {
    const { edition, question } = options
    if (!question.id) {
        throw new Error(
            `Question in "${edition.id}" with template "${question.template}" is missing its id`
        )
    } else {
        return question as QuestionWithId
    }
}
