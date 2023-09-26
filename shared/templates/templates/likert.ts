import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

export const likert: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        allowMultiple: true,
        optionsAreNumeric: true,
        inputComponent: 'likert',
        ...options.question
    } as QuestionTemplateOutput

    const paths = getPaths(
        { ...options, question },
        DbSuffixes.CHOICES,
        options?.question?.options?.map(o => String(o.id))
    )
    const output = {
        ...paths,
        ...question
    }
    return output
}
