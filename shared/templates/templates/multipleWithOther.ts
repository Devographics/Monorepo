import { multiple } from './multiple'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const multipleWithOther: TemplateFunction = options => {
    const question = { ...options.question, inputComponent: 'multipleWithOther', allowOther: true }
    const output: QuestionTemplateOutput = multiple({ ...options, question })
    return output
}
