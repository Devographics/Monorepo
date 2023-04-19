import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const number: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        ...getPaths(options, DbSuffixes.CHOICES),
        optionsAreNumeric: true,
        ...question
    }
    return output
}
