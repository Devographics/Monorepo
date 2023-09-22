import { multiple } from './multiple'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import followups from '../followups.yml'

export const multipleWithOtherSentiment: TemplateFunction = options => {
    const question = {
        inputComponent: 'multipleWithOtherSentiment',
        allowOther: true,
        allowComment: true,
        followups: followups.multipleWithOtherSentiment,
        ...options.question
    }
    const output: QuestionTemplateOutput = multiple({ ...options, question })
    return output
}
