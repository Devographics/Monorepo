import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'
import { multipleWithOther } from './multipleWithOther'

export const race_ethnicity: TemplateFunction = options => {
    const id = 'race_ethnicity'
    const output: QuestionTemplateOutput = {
        ...multipleWithOther(addQuestionId(options, id)),
        ...questionOptions[id]
    }
    return output
}
