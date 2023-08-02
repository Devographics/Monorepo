import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const company_size: TemplateFunction = options => {
    const id = 'company_size'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        optionsAreSequential: true,
        optionsAreRange: true,
        ...questionOptions[id]
    }
    return output
}
