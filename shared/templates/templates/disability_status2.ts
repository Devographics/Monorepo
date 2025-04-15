import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'
import { multipleWithOther } from './multipleWithOther'

// same as disability_status but with different options
export const disability_status2: TemplateFunction = options => {
    const id = 'disability_status'
    const output: QuestionTemplateOutput = {
        ...multipleWithOther(addQuestionId(options, id)),
        matchTags: ['disabilities'],
        ...questionOptions['disability_status2']
    }
    return output
}
