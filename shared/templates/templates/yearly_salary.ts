import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const yearly_salary: TemplateFunction = options => {
    const id = 'yearly_salary'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        optionsAreSequential: true,
        optionsAreRange: true,
        ...questionOptions[id]
    }
    return output
}
