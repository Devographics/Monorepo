import { feature } from './feature'
import followups from '../followups.yml'
import { TemplateFunction, QuestionTemplateOutput, DbSuffixes } from '@devographics/types'
import { getPaths } from '../helpers'

export const featurev3: TemplateFunction = options => {
    let output: QuestionTemplateOutput = {
        ...feature(options),
        allowComment: false,
        inputComponent: 'featurev3',
        followups: followups.featurev3
    }

    if (options.question.followups) {
        // if question does define its own followups, use that instead of the generic
        // feature followups
        output.followups = options.question.followups
    }
    output = { ...output, ...getPaths({ ...options, question: output }, DbSuffixes.EXPERIENCE) }

    return output
}
