import { DbSuffixes, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { checkHasId } from '../helpers'

export const others: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)
    const questionSegment = question.id?.replace('_others', '')
    const output: QuestionTemplateOutput = {
        rawPaths: {
            response: `${edition.id}__${section.slug || section.id}__${questionSegment}__${
                DbSuffixes.OTHERS
            }`
        },
        normPaths: {
            response: `${section.slug || section.id}.${questionSegment}.${DbSuffixes.OTHERS}.${
                DbSuffixes.NORMALIZED
            }`
        },
        ...question
    }
    return output
}
