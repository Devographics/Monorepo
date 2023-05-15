import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { FEATURES_OPTIONS } from '@devographics/constants'
import { getPaths, checkHasId } from '../helpers'
import { DbSuffixes } from '@devographics/types'

export const feature: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        allowComment: true,
        options: FEATURES_OPTIONS.map(id => ({
            id,
            intlId: `options.features.${id}`
        })),
        defaultSort: 'options',
        ...question
    }
    const output2: QuestionTemplateOutput = {
        ...output,
        ...getPaths({ ...options, question: output }, DbSuffixes.EXPERIENCE)
    }
    return output2
}
