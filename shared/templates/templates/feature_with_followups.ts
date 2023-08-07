import { feature } from './feature'
import followups from '../followups.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const featureWithFollowups: TemplateFunction = options => {
    const output: QuestionTemplateOutput = {
        ...feature(options),
        inputComponent: 'feature',
        followups: followups.feature
    }
    if (options.question.followups) {
        // if question does define its own followups, use that instead of the generic
        // feature followups
        output.followups = options.question.followups
    }
    return output
}
