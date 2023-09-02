import { feature } from './feature'
import followups from '../followups.yml'
import { TemplateFunction, QuestionTemplateOutput, DbSuffixes } from '@devographics/types'
import { getPaths } from '../helpers'
import { FEATURES_OPTIONS } from '@devographics/constants'

export const featurev3: TemplateFunction = options => {
    const question = {
        allowComment: true,
        options: FEATURES_OPTIONS.map(id => ({
            id,
            intlId: `options.features.${id}.short`
        })),
        defaultSort: 'options',
        inputComponent: 'featurev3',
        followups: followups.featurev3,
        ...options.question
    } as QuestionTemplateOutput

    if (options.question.followups) {
        // if question does define its own followups, use that instead of the generic
        // feature followups
        question.followups = options.question.followups
    }

    const output: QuestionTemplateOutput = {
        ...question,
        ...getPaths({ ...options, question }, DbSuffixes.EXPERIENCE)
    }

    return output
}
