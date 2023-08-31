import { FeaturesOptions, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { FEATURES_OPTIONS2 } from '@devographics/constants'
import { getPaths, checkHasId } from '../helpers'
import { DbSuffixes } from '@devographics/types'
import allFollowups from '../followups.yml'

export const featurev2: TemplateFunction = options => {
    checkHasId(options)

    const followups = allFollowups.feature

    const question = {
        allowComment: true,
        options: FEATURES_OPTIONS2.map(id => ({
            id,
            intlId: `options.features.${id}`
        })),
        defaultSort: 'options',
        // followups,
        inputComponent: 'feature',
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...question,
        ...getPaths({ ...options, question }, DbSuffixes.EXPERIENCE)
    }

    return output
}
