import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const dropdown: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        allowMultiple: false,
        ...options.question
    } as QuestionTemplateOutput

    const output = {
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
