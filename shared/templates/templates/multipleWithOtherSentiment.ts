import { multiple } from './multiple'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import followups from '../followups.yml'

export const multipleWithOtherSentiment: TemplateFunction = options => {
    const question = {
        ...options.question,
        inputComponent: 'multipleWithOtherSentiment',
        allowOther: true,
        followups: followups.multipleWithOtherSentiment
    }
    const output: QuestionTemplateOutput = multiple({ ...options, question })
    return output
}
