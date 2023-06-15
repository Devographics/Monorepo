import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const single: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        extends: 'single',
        allowMultiple: false,
        defaultSort: 'options',
        ...options.question
    } as QuestionTemplateOutput

    const output = {
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
