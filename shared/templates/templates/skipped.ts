import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const skipped: TemplateFunction = options => {
    const { question } = options
    const output: QuestionTemplateOutput = {
        id: 'skipped',
        normPaths: {
            response: 'skipped'
        },
        ...question
    }
    return output
}
