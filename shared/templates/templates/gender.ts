import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const gender: TemplateFunction = options => {
    const id = 'gender'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        ...questionOptions[id],
        inputComponent: 'gender'
    }
    return output
}
