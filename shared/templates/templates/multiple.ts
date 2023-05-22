import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const multiple: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        extends: 'multiple',
        randomize: true,
        allowMultiple: true,
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
