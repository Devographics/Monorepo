import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'
import { multipleWithOther } from './multipleWithOther'

export const disability_status: TemplateFunction = options => {
    const id = 'disability_status'
    const output: QuestionTemplateOutput = {
        ...multipleWithOther(addQuestionId(options, id)),
        matchTags: ['disabilities'],
        ...questionOptions[id]
    }
    return output
}
