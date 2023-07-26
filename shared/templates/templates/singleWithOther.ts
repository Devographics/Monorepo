import { single } from './single'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const singleWithOther: TemplateFunction = options => {
    const question = { ...options.question, allowOther: true }
    const output: QuestionTemplateOutput = single({ ...options, question })
    return output
}
