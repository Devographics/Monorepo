import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'
import { DbSuffixes } from '@devographics/types'
import { checkHasId } from '../helpers'

export const project: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question?.id?.replace('_prenormalized', '')

    const output: QuestionTemplateOutput = {
        rawPaths: {
            response: `${edition.id}__${sectionSegment}__${questionSegment}__${DbSuffixes.PRENORMALIZED}`
        },
        normPaths: {
            response: `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}.${DbSuffixes.NORMALIZED}`
        },
        ...question
    }
    return output
}
