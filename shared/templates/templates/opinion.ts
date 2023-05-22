import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const opinion: TemplateFunction = options => {
    const question = checkHasId(options)
    const output: QuestionTemplateOutput = {
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({
            id: String(i),
            intlId: `options.opinions.${String(i)}`
        })),
        ...getPaths(options),
        ...question
    }
    return output
}
