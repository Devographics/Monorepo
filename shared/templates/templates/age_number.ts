import { number } from './number'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const age_number: TemplateFunction = options => {
    const id = 'age'
    const output: QuestionTemplateOutput = number(addQuestionId(options, id))
    return output
}
