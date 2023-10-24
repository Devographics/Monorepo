import { checkHasId } from '../helpers'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'

export const likert_option: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        allowMultiple: false,
        defaultSort: 'options',
        hidden: true,
        options: [0, 1, 2, 3, 4].map(i => ({ id: i })),
        optionsAreNumeric: true,
        ...options.question
    } as QuestionTemplateOutput

    const paths = {
        rawPaths: {
            response: `${options.section.id}__${options.question.id}`
        },
        normPaths: {
            base: `${options.section.id}.${options.question.id?.replace('__', '.')}`,
            response: `${options.section.id}.${options.question.id?.replace('__', '.')}`
        }
    }

    const output = {
        ...paths,
        ...question
    }
    return output
}
