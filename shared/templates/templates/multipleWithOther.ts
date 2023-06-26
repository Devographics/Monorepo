import { multiple } from './multiple'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const multipleWithOther: TemplateFunction = options => {
    const output: QuestionTemplateOutput = {
        ...multiple(options),
        allowOther: true
    }
    return output
}
