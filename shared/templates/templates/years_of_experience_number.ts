import { number } from './number'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const years_of_experience_number: TemplateFunction = options => {
    const id = 'years_of_experience'
    const output: QuestionTemplateOutput = number(addQuestionId(options, id))
    return output
}
