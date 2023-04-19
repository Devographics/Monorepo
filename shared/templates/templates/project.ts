import { DbPaths, QuestionTemplateOutput, TemplateFunction, DbSuffixes } from '@devographics/types'
import { checkHasId } from '../helpers'

export const project: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const sectionSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id
    const questionSegment = question?.id?.replace('_prenormalized', '')

    const basePath = `${sectionSegment}.${questionSegment}.${DbSuffixes.OTHERS}`

    const normPaths: DbPaths = {
        raw: `${basePath}.${DbSuffixes.RAW}`,
        patterns: `${basePath}.${DbSuffixes.PATTERNS}`,
        error: `${basePath}.${DbSuffixes.ERROR}`,
        response: `${basePath}.${DbSuffixes.NORMALIZED}`
    }

    const output: QuestionTemplateOutput = {
        rawPaths: {
            response: `${edition.id}__${sectionSegment}__${questionSegment}__${DbSuffixes.PRENORMALIZED}`
        },
        normPaths,
        ...question
    }
    return output
}
