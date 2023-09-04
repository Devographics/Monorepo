import { text } from './text'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const textlist: TemplateFunction = options => {
    const question = { ...options.question, inputComponent: 'textList' }
    const output: QuestionTemplateOutput = text({ ...options, question })
    return output
}
