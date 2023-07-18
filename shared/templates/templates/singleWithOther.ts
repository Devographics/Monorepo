import { single } from './single'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const singleWithOther: TemplateFunction = options => {
    const output: QuestionTemplateOutput = {
        ...single(options),
        allowOther: true
    }
    return output
}
