import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const opinion: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({
            id: i,
            intlId: `options.opinions.${String(i)}`
        })),
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...getPaths({ ...options, question }),
        ...question
    }

    return output
}
