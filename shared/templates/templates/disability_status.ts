import { multiple } from './multiple'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const disability_status: TemplateFunction = options => {
    const id = 'disability_status'
    const output: QuestionTemplateOutput = {
        ...multiple(addQuestionId(options, id)),
        ...questionOptions[id]
    }
    return output
}
