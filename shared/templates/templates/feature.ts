import { FeaturesOptions, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { FEATURES_OPTIONS } from '@devographics/constants'
import { getPaths, checkHasId } from '../helpers'
import { DbSuffixes } from '@devographics/types'
import allFollowups from '../followups.yml'

export const feature: TemplateFunction = options => {
    checkHasId(options)

    const followups = allFollowups.feature

    const question = {
        allowComment: true,
        options: FEATURES_OPTIONS.map(id => ({
            id,
            intlId: `options.features.${id}`
        })),
        defaultSort: 'options',
        followups,
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...question,
        ...getPaths({ ...options, question }, DbSuffixes.EXPERIENCE)
    }
    return output
}
