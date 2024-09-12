import { DbSuffixes, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const opinion: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        inputComponent: 'single',
        allowMultiple: false,
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({
            id: i,
            intlId: `options.opinions.${String(i)}`
        })),
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...getPaths({ ...options, question }, DbSuffixes.CHOICES),
        ...question
    }

    return output
}
