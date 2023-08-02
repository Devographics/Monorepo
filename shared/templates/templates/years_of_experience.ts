import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const years_of_experience: TemplateFunction = options => {
    const id = 'years_of_experience'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        optionsAreSequential: true,
        optionsAreRange: true,
        ...questionOptions[id]
    }
    return output
}
