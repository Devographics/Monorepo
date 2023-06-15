import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const number: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        optionsAreNumeric: true,
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
    return output
}
