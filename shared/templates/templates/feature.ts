import { FeaturesOptions, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { FEATURES_OPTIONS } from '@devographics/constants'
import { getPaths, checkHasId } from '../helpers'
import { DbSuffixes } from '@devographics/types'

// note: does not support followups! use featureWithFollowups for that

export const feature: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        countsTowardScore: true,
        allowComment: true,
        options: FEATURES_OPTIONS.map(id => ({
            id,
            intlId: `options.features.${id}`
        })),
        defaultSort: 'options',
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...question,
        ...getPaths({ ...options, question }, DbSuffixes.EXPERIENCE)
    }

    return output
}
