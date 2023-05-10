import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const single: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        extends: 'single',
        allowMultiple: false,
        defaultSort: 'options',
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
