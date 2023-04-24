import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const higher_education_degree: TemplateFunction = options => {
    const id = 'higher_education_degree'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        ...questionOptions[id]
    }
    return output
}
