import { feature } from './feature'
import followups from '../followups.yml'
import { TemplateFunction, QuestionTemplateOutput, DbSuffixes } from '@devographics/types'
import { getPaths } from '../helpers'

export const featureWithFollowups: TemplateFunction = options => {
    let output: QuestionTemplateOutput = {
        ...feature(options),
        allowComment: false,
        inputComponent: 'feature',
        followups: followups.feature
    }

    if (options.question.followups) {
        // if question does define its own followups, use that instead of the generic
        // feature followups
        output.followups = options.question.followups
    }
    output = { ...output, ...getPaths({ ...options, question: output }, DbSuffixes.EXPERIENCE) }

    return output
}

export const featureWithFollowups2 = featureWithFollowups
