import { QuestionTemplateOutput, TemplateFunction, DbSuffixes } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'
import { TOOLS_OPTIONS } from '@devographics/constants'

export const tool: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        allowComment: true,
        options: TOOLS_OPTIONS.map(id => ({
            id
        })),
        i18nNamespace: 'tools',
        defaultSort: 'options',
        ...question
    }

    const output2: QuestionTemplateOutput = {
        ...output,
        ...getPaths({ ...options, question: output }, DbSuffixes.EXPERIENCE)
    }
    return output2
}
