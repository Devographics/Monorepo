import { multiple } from './multiple'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const race_ethnicity: TemplateFunction = options => {
    const id = 'race_ethnicity'
    const output: QuestionTemplateOutput = {
        ...multiple(addQuestionId(options, id)),
        ...questionOptions[id]
    }
    return output
}
