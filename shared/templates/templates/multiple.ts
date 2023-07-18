import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const multiple: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        allowMultiple: true,
        ...options.question
    } as QuestionTemplateOutput

    const output = {
        ...getPaths({ ...options, question }, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
