import { text } from './text'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const textlist: TemplateFunction = options => {
    const id = 'textlist'
    const output: QuestionTemplateOutput = {
        ...text(addQuestionId(options, id))
    }
    return output
}
