import { QuestionTemplateOutput, TemplateFunction, DbSuffixes } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'
import { TOOLS_OPTIONS } from '@devographics/constants'

export const tool: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        allowComment: true,
        options: TOOLS_OPTIONS.map(id => ({
            id,
            intlId: `options.tools.${id}`
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
